import * as S from "./types"
import { createDraft, finishDraft, Draft, original } from "immer"

export function createEventChain<D>(options: S.EventChainOptions<D>) {
  let { state, onDelayedOutcome, getFreshDataAfterWait } = options
  let handlers = [...options.handler]
  const { payload } = options

  let waiting = false

  let core: S.EventChainCore<D> = {
    data: options.data,
    result: options.result,
  }

  let finalOutcome: S.EventChainOutcome<D> = {
    ...core,
    shouldBreak: false,
    shouldNotify: false,
    pendingSend: undefined,
    pendingTransition: undefined,
  }

  let draftCore: Draft<S.EventChainCore<D>> = createDraft(core)

  let orig = original(draftCore) as Draft<S.EventChainCore<D>>

  let tResult = orig?.result

  function complete(draft: Draft<S.EventChainCore<D>>) {
    core = finishDraft(draft) as S.EventChainCore<D>
    finalOutcome.result = core.result
    finalOutcome.data = core.data
  }

  function refresh() {
    draftCore = createDraft(core)
    orig = original(draftCore) as Draft<S.EventChainCore<D>>
    tResult = orig?.result
  }

  function processEventHandler(
    eventHandler: S.EventHandler<D>,
    draft: Draft<S.EventChainCore<D>>
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
        nextHandlerObject.wait((draft.data as D) as D, payload, draft.result) *
        1000

      // Notify, if necessary
      if (waiting && finalOutcome.shouldNotify) {
        complete(draftCore)
        onDelayedOutcome(finalOutcome)
      }

      waiting = true

      // TODO: Does timeouts need to be an array?
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

      return { shouldBreakDueToWait: true }

      // Stop this chain
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
    handler: S.EventHandlerObject<D>,
    draft: Draft<S.EventChainCore<D>>
  ): { shouldBreak: boolean } {
    let passedConditions = true

    // Compute a result using original data and draft result
    if (handler.get.length > 0) {
      for (let resu of handler.get) {
        tResult = resu(draft.data as D, payload, tResult)
      }

      // Save result to draft
      draft.result = tResult
    }

    // Conditions — use original data / result
    if (passedConditions && handler.if.length > 0) {
      passedConditions = handler.if.every((cond) =>
        cond(draft.data as D, payload, tResult)
      )
    }

    if (passedConditions && handler.ifAny.length > 0) {
      passedConditions = handler.ifAny.some((cond) =>
        cond(draft.data as D, payload, tResult)
      )
    }

    if (passedConditions && handler.unless.length > 0) {
      passedConditions = handler.unless.every(
        (cond) => !cond(draft.data as D, payload, tResult)
      )
    }

    if (passedConditions && handler.unlessAny.length > 0) {
      passedConditions = !handler.unlessAny.some((cond) =>
        cond(draft.data as D, payload, tResult)
      )
    }

    // Create temporary human-readable copy of data

    if (passedConditions) {
      // Actions
      if (handler.do.length > 0) {
        finalOutcome.shouldNotify = true

        for (let action of handler.do) {
          action(draft.data as D, payload, tResult)
        }
      }

      // Side effects
      if (handler.secretlyDo.length > 0) {
        for (let action of handler.secretlyDo) {
          action(draft.data as D, payload, tResult)
        }
      }

      // Sends
      if (handler.send !== undefined) {
        const event = handler.send(draft.data as D, payload, tResult)
        finalOutcome.pendingSend = event
      }

      // Transitions
      if (handler.to !== undefined) {
        finalOutcome.pendingTransition = handler.to(
          draft.data as D,
          payload,
          tResult
        )

        finalOutcome.shouldBreak = true
        finalOutcome.shouldNotify = true
        return { shouldBreak: true }
      }

      // Secret Transitions
      if (handler.secretlyTo !== undefined) {
        finalOutcome.pendingTransition = handler.secretlyTo(
          draft.data as D,
          payload,
          tResult
        )
      }

      // Then
      if (handler.then !== undefined) {
        processEventHandler([...handler.then], draft)
      }

      // Break
      if (handler.break !== undefined) {
        if (handler.break(draft.data as D, payload, tResult)) {
          return { shouldBreak: true }
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
