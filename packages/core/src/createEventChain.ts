import * as S from "./types"
import { createDraft, finishDraft, Draft, current } from "immer"
import { testEventHandlerConditions } from "./testEventHandlerConditions"

export function createEventChain<G extends S.DesignedState>(
  options: S.EventChainOptions<G>
) {
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
    pendingSend: undefined,
    pendingTransition: [],
  }

  let draftCore: Draft<S.EventChainCore<G>> = createDraft(core)

  let tResult = options.result

  function complete(draft: Draft<S.EventChainCore<G>>) {
    core = finishDraft(draft) as S.EventChainCore<G>
    finalOutcome.result = core.result
    finalOutcome.data = core.data
  }

  function refresh() {
    draftCore = createDraft(core)
  }

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

        refresh()

        const { shouldBreak } = processHandlerObject(
          nextHandlerObject,
          draftCore
        )

        if (!shouldBreak) {
          const { shouldBreakDueToWait } = processEventHandler(
            handlers,
            draftCore
          )

          if (shouldBreakDueToWait) {
            // If the event handler produced a wait, then it
            // will have also refreshed the core and notified
            // subscribers, if necessary.
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

  function processHandlerObject(
    handler: S.EventHandlerObject<G>,
    draft: Draft<S.EventChainCore<G>>
  ): { shouldBreak: boolean } {
    // Compute a result using original data and draft result
    if (handler.get.length > 0) {
      try {
        for (let resu of handler.get) {
          tResult = resu(draft.data as G["data"], payload, tResult)
        }
      } catch (e) {
        console.error("Error in event handler object's results! ", e.message)
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

    // Create temporary human-readable copy of data

    if (passedConditions) {
      // Actions
      if (handler.do.length > 0) {
        finalOutcome.shouldNotify = true

        try {
          for (let action of handler.do) {
            action(draft.data as G["data"], curr.payload, curr.result)
          }
        } catch (e) {
          console.error("Error in event handler's actions! ", e.message)
        }
      }

      // Secret actions
      if (handler.secretlyDo.length > 0) {
        try {
          for (let action of handler.secretlyDo) {
            action(draft.data as G["data"], curr.payload, curr.result)
          }
        } catch (e) {
          console.error("Error in event handler's secret actions! ", e.message)
        }
      }

      curr = current(draft)

      // Sends
      if (handler.send !== undefined) {
        try {
          const event = handler.send(
            curr.data as G["data"],
            curr.payload,
            curr.result
          )
          finalOutcome.pendingSend = event
        } catch (e) {
          console.error("Error computing event handler's send! ", e.message)
        }
      }

      // Transitions
      if (handler.to.length > 0) {
        try {
          finalOutcome.pendingTransition.push(
            ...handler.to.map((t) =>
              t(curr.data as G["data"], curr.payload, curr.result)
            )
          )
          finalOutcome.shouldBreak = true
          finalOutcome.shouldNotify = true
          return { shouldBreak: true }
        } catch (e) {
          console.error(
            "Error computing event handler's transition! ",
            e.message
          )
        }
      }

      // Secret Transitions (no notify)
      if (handler.secretlyTo.length > 0) {
        try {
          finalOutcome.pendingTransition.push(
            ...handler.secretlyTo.map((t) =>
              t(curr.data as G["data"], curr.payload, curr.result)
            )
          )

          finalOutcome.shouldBreak = true
          return { shouldBreak: true }
        } catch (e) {
          console.error(
            "Error computing event handler's secret transitions! ",
            e.message
          )
        }
      }

      // Then
      if (handler.then !== undefined) {
        processEventHandler([...handler.then], draft)
      }

      // TODO: Is there a difference between break and halt? Halt breaks all, break breaks just one subchain, like else or then?

      // Break
      if (handler.break !== undefined) {
        try {
          if (
            handler.break(curr.data as G["data"], curr.payload, curr.result)
          ) {
            return { shouldBreak: true }
          }
        } catch (e) {
          console.error("Error computing event handler's break! ", e.message)
        }
      }
    } else {
      // Else
      if (handler.else !== undefined) {
        processEventHandler([...handler.else], draft)
      }
    }

    return { shouldBreak: false }
  }

  processEventHandler(handlers, draftCore)

  complete(draftCore)

  return finalOutcome
}
