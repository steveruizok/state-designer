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
        core = finishDraft(draftCore) as Core<D>
        finalOutcome.data = core.data
        onAsyncUpdate(finalOutcome)
        draftCore = createDraft(core)
      }

      waiting = true

      setTimeout(() => {
        core.data = onRefreshDataAfterWait() // After the timeout, refresh data
        core.result = undefined // Results can't be carried across!

        draftCore = createDraft(core)
        processHandlerObject(nextHandlerObject, draftCore)
        processEventHandler(handlers, draftCore)

        core = finishDraft(draftCore) as Core<D>
        finalOutcome.data = core.data
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

    // Create new original from draft
    let orig = original(draft) as Draft<Core<D>>

    // Compute a result using original data and draft result
    if (handler.get.length > 0) {
      for (let resu of handler.get) {
        draft.result = resu(orig.data as D, payload, draft.result)
      }

      // Refresh original after result changes
      orig = original(draft) as Draft<Core<D>>
    }

    // Conditions — use original data / result

    if (passedConditions && handler.if.length > 0) {
      passedConditions = handler.if.every((cond) =>
        cond(orig.data as D, payload, orig.result)
      )
    }

    if (passedConditions && handler.unless.length > 0) {
      passedConditions = handler.unless.every(
        (cond) => !cond(orig.data as D, payload, orig.data)
      )
    }

    if (passedConditions && handler.ifAny.length > 0) {
      passedConditions = handler.ifAny.some((cond) =>
        cond(orig.data as D, payload, orig.data)
      )
    }

    if (passedConditions) {
      // Actions
      if (handler.do.length > 0) {
        finalOutcome.shouldNotify = true

        for (let action of handler.do) {
          action(orig.data as D, payload, orig.data)
        }
      }

      // Create new original from draft
      orig = original(draft) as Draft<Core<D>>

      // Side effects
      if (handler.secretlyDo.length > 0) {
        for (let action of handler.secretlyDo) {
          action(orig.data as D, payload, orig.result)
        }
      }

      // Sends
      if (handler.send !== undefined) {
        const event = handler.send(orig.data as D, payload, orig.result)
        finalOutcome.pendingSend = event
      }

      // Transitions
      if (handler.to !== undefined) {
        finalOutcome.pendingTransition = handler.to(
          orig.data as D,
          payload,
          orig.result
        )

        finalOutcome.shouldBreak = true
        finalOutcome.shouldNotify = true
      }
    } else {
      if (handler.else !== undefined) {
        processEventHandler([...handler.else], draft)
      }
    }

    processEventHandler(handlers, draft)
  }

  processEventHandler(handlers, draftCore)
  core = finishDraft(draftCore) as Core<D>

  finalOutcome.data = core.data

  return finalOutcome
}
