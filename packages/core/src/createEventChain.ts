import * as S from "./types"
import { createDraft, finishDraft, Draft, current } from "immer"

export function createEventChain<D>(options: S.EventChainOptions<D>) {
  let { state, onDelayedOutcome, getFreshDataAfterWait } = options
  let handlers = [...options.handler]
  const { payload } = options

  let waiting = false

  let core: S.EventChainCore<D> = {
    data: options.data,
    payload: options.payload,
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

  let tResult = options.result

  function complete(draft: Draft<S.EventChainCore<D>>) {
    core = finishDraft(draft) as S.EventChainCore<D>
    finalOutcome.result = core.result
    finalOutcome.data = core.data
  }

  function refresh() {
    draftCore = createDraft(core)
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
    handler: S.EventHandlerObject<D>,
    draft: Draft<S.EventChainCore<D>>
  ): { shouldBreak: boolean } {
    // Compute a result using original data and draft result
    if (handler.get.length > 0) {
      for (let resu of handler.get) {
        tResult = resu(draft.data as D, payload, tResult)
      }

      // Save result to draft
      draft.result = tResult
    }

    let curr = current(draft)

    const passedConditions = testEventHandlerConditions(
      handler,
      curr.data as D,
      curr.payload,
      curr.result
    )

    // Create temporary human-readable copy of data

    if (passedConditions) {
      // Actions
      if (handler.do.length > 0) {
        finalOutcome.shouldNotify = true

        for (let action of handler.do) {
          action(draft.data as D, curr.payload, curr.result)
        }
      }

      // Secret actions
      if (handler.secretlyDo.length > 0) {
        for (let action of handler.secretlyDo) {
          action(draft.data as D, curr.payload, curr.result)
        }
      }

      curr = current(draft)

      // Sends
      if (handler.send !== undefined) {
        const event = handler.send(curr.data as D, curr.payload, curr.result)
        finalOutcome.pendingSend = event
      }

      // Transitions
      if (handler.to !== undefined) {
        finalOutcome.pendingTransition = handler.to(
          curr.data as D,
          curr.payload,
          curr.result
        )
        finalOutcome.shouldBreak = true
        finalOutcome.shouldNotify = true

        return { shouldBreak: true }
      }

      // Secret Transitions (no notify)
      if (handler.secretlyTo !== undefined) {
        finalOutcome.pendingTransition = handler.secretlyTo(
          curr.data as D,
          curr.payload,
          curr.result
        )

        finalOutcome.shouldBreak = true
        return { shouldBreak: true }
      }

      // Then
      if (handler.then !== undefined) {
        processEventHandler([...handler.then], draft)
      }

      // TODO: Is there a difference between break and halt? Halt breaks all, break breaks just one subchain, like else or then?

      // Break
      if (handler.break !== undefined) {
        if (handler.break(curr.data as D, curr.payload, curr.result)) {
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

function testEventHandlerConditions<D, P, R>(
  h: S.EventHandlerObject<D>,
  d: D,
  p: P,
  r: R
) {
  if (h.if[0] && !h.if.every((c) => c(d, p, r))) return false
  if (h.ifAny[0] && !h.ifAny.some((c) => c(d, p, r))) return false
  if (h.unless[0] && !h.unless.every((c) => !c(d, p, r))) return false
  if (h.unlessAny[0] && !h.unlessAny.some((c) => c(d, p, r))) return false
  return true
}
