import * as S from "./types"
import { createDraft, finishDraft, Draft, original } from "immer"

type Core<D> = {
  data: D
  result: any
}

type Callback<D> = (info: Outcome<D>) => void

type Outcome<D> = {
  data: D
  shouldBreak: boolean
  shouldNotify: boolean
  pendingTransition?: string
  pendingSend?: S.Event
}

type Options<D> = {
  data: D
  result: any
  payload: any
  handler: S.EventHandler<D>
  onAsyncUpdate: Callback<D>
  onRefreshDataAfterWait: () => D
}

export function createEventChain<D>(options: Options<D>) {
  let { onAsyncUpdate, onRefreshDataAfterWait } = options
  let handlers = [...options.handler]
  const { payload } = options

  let waiting = false
  let didBreak = false

  let finalOutcome: Outcome<D> = {
    data: options.data,
    shouldBreak: false,
    shouldNotify: false,
    pendingSend: undefined,
    pendingTransition: undefined,
  }

  let core = {
    data: options.data,
    result: options.result,
  }

  let draftCore: Draft<Core<D>> = createDraft(core)
  let orig = original(draftCore) as Draft<Core<D>>
  let tResult = orig?.result

  function complete(draft: Draft<Core<D>>) {
    core = finishDraft(draft) as Core<D>
    finalOutcome.data = core.data
  }

  function refresh() {
    draftCore = createDraft(core)
    orig = original(draftCore) as Draft<Core<D>>
    tResult = orig?.result
  }

  function processEventHandler(
    eventHandler: S.EventHandler<D>,
    draft: Draft<Core<D>>
  ) {
    if (didBreak) {
      return
    }

    if (finalOutcome.shouldBreak) {
      return
    }

    const nextHandlerObject = eventHandler.shift()

    if (nextHandlerObject === undefined) {
      return
    }

    if (nextHandlerObject.wait !== undefined) {
      // Calculate wait time from finalOutcome draft
      const waitTime =
        nextHandlerObject.wait((draft.data as D) as D, payload, draft.result) *
        1000

      // // Notify, if necessary
      if (waiting && finalOutcome.shouldNotify) {
        complete(draftCore)
        onAsyncUpdate(finalOutcome)
        refresh()
      }

      waiting = true

      setTimeout(() => {
        core.data = onRefreshDataAfterWait() // After the timeout, refresh data
        core.result = undefined // Results can't be carried across!

        refresh()

        processHandlerObject(nextHandlerObject, draftCore)
        processEventHandler(handlers, draftCore)

        complete(draftCore)
        onAsyncUpdate(finalOutcome)
      }, waitTime)

      // Stop this chain
    } else {
      // Continue with chain
      processHandlerObject(nextHandlerObject, draft)
    }
  }

  function processHandlerObject(
    handler: S.EventHandlerObject<D>,
    draft: Draft<Core<D>>
  ) {
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
    } else {
      // Else
      if (handler.else !== undefined) {
        processEventHandler([...handler.else], draft)
      }
    }

    processEventHandler(handlers, draft)
  }

  processEventHandler(handlers, draftCore)

  complete(draftCore)

  return finalOutcome
}
