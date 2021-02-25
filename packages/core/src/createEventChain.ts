import * as S from "./types"
import { createDraft, finishDraft, Draft, current } from "immer"
import { testEventHandlerConditions } from "./testEventHandlerConditions"

/**
 * Handle an event, along with its consequential events.
 * (Go get a cup of coffee because this is the hard part.)
 * An event chain will process an array of event handler
 * objects, each of which may include subchains (via `else`
 * or `then` properties). Depending on what these objects
 * do, we may have to update the data draft, break the
 * chain early, and/or set a flag to notify subscribers
 * of a change once we're done.
 * @param options
 */
export function createEventChain<G extends S.DesignedState>(
  options: S.EventChainOptions<G>
): S.EventChainOutcome<G> {
  let { state, onDelayedOutcome, getFreshDataAfterWait } = options
  let handlers = [...options.handler]
  const { payload } = options

  let waiting = false

  let core: S.EventChainCore<G> = {
    data: options.data,
    payload: options.payload,
    result: options.result,
  }

  let finalOutcome: S.EventChainOutcome<G> = {
    ...core,
    shouldBreak: false,
    shouldNotify: false,
    pendingTransition: [],
  }

  let draftCore: Draft<S.EventChainCore<G>> = createDraft(core)

  let tResult = options.result

  // Finish a draft and update the final outcome.
  function complete(draft: Draft<S.EventChainCore<G>>) {
    core = finishDraft(draft) as S.EventChainCore<G>
    finalOutcome.result = core.result
    finalOutcome.data = core.data
  }

  // Process an event handler object.
  function processHandlerObject(
    handler: S.EventHandlerObject<G>,
    draft: Draft<S.EventChainCore<G>>
  ): { shouldBreak: boolean } {
    // Compute a result using original data and draft result
    if (handler.get.length > 0) {
      let fnName = ""
      try {
        for (let result of handler.get) {
          fnName = result.name
          tResult = result(draft.data as G["data"], payload, tResult)
        }
      } catch (e) {
        throw Error(`Error in result (${fnName})! ` + e.message)
      }

      // Save result to draft
      draft.result = tResult
    }

    let curr = current(draft)

    const passedConditions = testEventHandlerConditions(
      handler,
      curr.data as G["data"],
      curr.payload,
      curr.result
    )

    if (passedConditions) {
      // Actions
      if (handler.do.length > 0) {
        finalOutcome.shouldNotify = true
        let fnName = ""

        try {
          for (let action of handler.do) {
            fnName = action.name
            action(draft.data as G["data"], curr.payload, curr.result)
          }
        } catch (e) {
          throw Error(`Error in action (${fnName})! ` + e.message)
        }
      }

      // Secret actions
      if (handler.secretlyDo.length > 0) {
        let fnName = ""
        try {
          for (let action of handler.secretlyDo) {
            fnName = action.name
            action(draft.data as G["data"], curr.payload, curr.result)
          }
        } catch (e) {
          throw Error(`Error in secret action (${fnName})! ` + e.message)
        }
      }

      // Create human readable form of the draft.
      // TODO: Do we have to do this for every object?
      curr = current(draft)

      // Transitions
      if (handler.to.length > 0) {
        let fnName = ""
        try {
          for (let fn of handler.to) {
            fnName = fn.name
            finalOutcome.pendingTransition.push(
              fn(curr.data as G["data"], curr.payload, curr.result)
            )
          }

          finalOutcome.shouldBreak = true
          finalOutcome.shouldNotify = true
          return { shouldBreak: true }
        } catch (e) {
          throw Error(`Error computing transition (${fnName})! ` + e.message)
        }
      }

      // Secret Transitions (no notify)
      if (handler.secretlyTo.length > 0) {
        let fnName = ""
        try {
          for (let fn of handler.secretlyTo) {
            fnName = fn.name
            finalOutcome.pendingTransition.push(
              fn(curr.data as G["data"], curr.payload, curr.result)
            )
          }

          finalOutcome.shouldBreak = true
          return { shouldBreak: true }
        } catch (e) {
          throw Error(
            `Error computing secret transition (${fnName})! ` + e.message
          )
        }
      }

      // Then
      if (handler.then !== undefined) {
        processEventHandler([...handler.then], draft)
      }

      // TODO: Is there a difference between break and halt? Halt breaks all,
      // break breaks just one subchain, like else or then?

      // Break
      if (handler.break !== undefined) {
        try {
          if (
            handler.break(curr.data as G["data"], curr.payload, curr.result)
          ) {
            return { shouldBreak: true }
          }
        } catch (e) {
          throw Error(
            `Error computing break (${handler.break.name})! ` + e.message
          )
        }
      }
    } else {
      // Else (only if conditions failed)
      if (handler.else !== undefined) {
        processEventHandler([...handler.else], draft)
      }
    }

    return { shouldBreak: false }
  }

  // Process an event handler (an array of event handler objects)
  function processEventHandler(
    eventHandler: S.EventHandler<G>,
    draft: Draft<S.EventChainCore<G>>
  ): { shouldBreakDueToWait: boolean } {
    if (finalOutcome.shouldBreak) {
      return { shouldBreakDueToWait: false }
    }

    const nextHandlerObject = eventHandler.shift()

    if (nextHandlerObject === undefined) {
      return { shouldBreakDueToWait: false }
    } else if (nextHandlerObject.wait !== undefined) {
      // Calculate wait time from finalOutcome draft
      const waitTime =
        nextHandlerObject.wait(
          (draft.data as G["data"]) as G["data"],
          payload,
          draft.result
        ) * 1000

      // Notify, if necessary
      if (waiting && finalOutcome.shouldNotify) {
        complete(draftCore)
        onDelayedOutcome(finalOutcome)
      }

      waiting = true

      // TODO: Does timeouts really need to be an array?
      state.times.timeouts[0] = setTimeout(() => {
        core.data = getFreshDataAfterWait() // After the timeout, refresh data
        core.result = undefined // Results can't be carried across!

        // Refresh
        draftCore = createDraft(core)

        const { shouldBreak } = processHandlerObject(
          nextHandlerObject,
          draftCore
        )

        if (!shouldBreak) {
          const { shouldBreakDueToWait } = processEventHandler(
            handlers,
            draftCore
          )

          // If the event handler produced a wait, then it
          // will have also refreshed the core and notified
          // subscribers, if necessary.
          if (shouldBreakDueToWait) {
            return
          }
        }

        complete(draftCore)
        onDelayedOutcome(finalOutcome)
      }, waitTime)

      // Stop this chain
      return { shouldBreakDueToWait: true }
    } else {
      // Continue with chain
      const { shouldBreak } = processHandlerObject(nextHandlerObject, draft)

      if (!shouldBreak) {
        return processEventHandler(eventHandler, draft)
      }

      return { shouldBreakDueToWait: false }
    }
  }

  processEventHandler(handlers, draftCore)

  complete(draftCore)

  return finalOutcome
}
