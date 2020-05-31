import * as S from "./types"
import { createDraft, finishDraft, Draft } from "immer"

type Core<D> = {
  data: D
  payload: any
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
    payload: options.payload,
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
        nextHandlerObject.wait(
          (draft.data as D) as D,
          draft.payload,
          draft.result
        ) * 1000

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

    for (let resu of handler.get) {
      draft.result = resu(draft.data as D, draft.payload, draft.result)
    }

    // Conditions

    if (passedConditions && handler.if.length > 0) {
      passedConditions = handler.if.every((cond) =>
        cond(draft.data as D, draft.payload, draft.result)
      )
    }

    if (passedConditions && handler.unless.length > 0) {
      passedConditions = handler.unless.every(
        (cond) => !cond(draft.data as D, draft.payload, draft.result)
      )
    }

    if (passedConditions && handler.ifAny.length > 0) {
      passedConditions = handler.ifAny.some((cond) =>
        cond(draft.data as D, draft.payload, draft.result)
      )
    }

    if (passedConditions) {
      // Actions
      if (handler.do.length > 0) {
        finalOutcome.shouldNotify = true

        for (let action of handler.do) {
          action(draft.data as D, draft.payload, draft.result)
        }
      }

      // Side effects
      if (handler.secretlyDo.length > 0) {
        for (let action of handler.secretlyDo) {
          action(draft.data as D, draft.payload, draft.result)
        }
      }

      // Sends
      if (handler.send !== undefined) {
        const event = handler.send(draft.data as D, draft.payload, draft.result)
        finalOutcome.pendingSend = event
      }

      // Transitions
      if (handler.to !== undefined) {
        finalOutcome.pendingTransition = handler.to(
          draft.data as D,
          draft.payload,
          draft.result
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

// export class EventChain<D> {
//   handlers: S.EventHandlerObject<D>[] = []
//   core: Core<D>
//   draft: Draft<Core<D>>
//   shouldNotify: boolean = false
//   shouldBreak: boolean = false
//   pendingTransition?: string
//   pendingSend?: S.Event
//   onNotifyAfterWait: Callback<D>
//   onRefreshDataAfterWait: () => D

//   constructor(options: Options<D>) {
//     this.handlers = options.handler
//     this.onNotifyAfterWait = options.onNotifyAfterWait
//     this.onRefreshDataAfterWait = options.onRefreshDataAfterWait

//     this.core = {
//       data: options.data,
//       result: options.result,
//       payload: options.payload,
//     }

//     this.draft = createDraft(this.core)
//     this.processEventHandler(this.draft)
//   }

//   processEventHandler = (draft: Draft<Core<D>>): Outcome<D> => {
//     if (this.shouldBreak) {
//       return this.finalizeDraft()
//     }

//     const nextHandlerObject = this.handlers.shift()

//     if (nextHandlerObject === undefined) {
//       return this.finalizeDraft()
//     }

//     if (nextHandlerObject.wait) {
//       // Calculate wait time from finalOutcome draft
//       const waitTime =
//         nextHandlerObject.wait((draft.data as D) as D, draft.payload, draft.result) * 1000

//       // Seal the mutable core draft
//       this.core = finishDraft(draft) as Core<D>

//       // Notify, if necessary
//       if (this.shouldNotify) {
//         this.onNotifyAfterWait(this.core)
//       }

//       setTimeout(() => {
//         this.core.data = this.onRefreshDataAfterWait() // After the timeout, refresh data
//         this.core.result = undefined // Results can't be carried across!
//         this.draft = createDraft(this.core) // Create a new draft from core

//         // Continue with chain
//         this.processHandlerObject(nextHandlerObject, this.draft)
//         this.processEventHandler(this.draft)
//       }, waitTime)

//       // Stop this chain
//       return this.finalizeDraft()
//     }

//     // Continue with chain
//     this.processHandlerObject(nextHandlerObject, draft)
//     return this.processEventHandler(draft)
//   }

//   processHandlerObject = (
//     handler: S.EventHandlerObject<D>,
//     draft: Draft<Core<D>>
//   ) => {
//     let passedConditions = true

//     for (let resu of handler.get) {
//       draft.result = resu(draft.data as D, draft.payload, draft.result)
//     }

//     // Conditions

//     if (passedConditions && handler.if.length > 0) {
//       passedConditions = handler.if.every((cond) =>
//         cond(draft.data as D, draft.payload, draft.result)
//       )
//     }

//     if (passedConditions && handler.unless.length > 0) {
//       passedConditions = handler.unless.every(
//         (cond) => !cond(draft.data as D, draft.payload, draft.result)
//       )
//     }

//     if (passedConditions && handler.ifAny.length > 0) {
//       passedConditions = handler.ifAny.some((cond) =>
//         cond(draft.data as D, draft.payload, draft.result)
//       )
//     }

//     if (passedConditions) {
//       // Actions
//       if (handler.do.length > 0) {
//         this.shouldNotify = true

//         for (let action of handler.do) {
//           action(draft.data as D, draft.payload, draft.result)
//         }
//       }

//       // Side effects
//       if (handler.secretlyDo.length > 0) {
//         for (let action of handler.secretlyDo) {
//           action(draft.data as D, draft.payload, draft.result)
//         }
//       }

//       // Sends
//       if (handler.send !== undefined) {
//         const event = handler.send(draft.data as D, draft.payload, draft.result)
//         this.pendingSend = event
//       }

//       // Transitions
//       if (handler.to !== undefined) {
//         this.pendingTransition = handler.to(
//           draft.data as D,
//           draft.payload,
//           draft.result
//         )

//         this.shouldBreak = true
//         this.shouldNotify = true
//       }
//     }
//   }

//   finalizeDraft = (): Outcome<D> => {
//     this.core = finishDraft(this.draft) as Core<D>

//     return {
//       data: this.core.data,
//       shouldNotify: this.shouldNotify,
//       pendingTransition: this.pendingTransition,
//       pendingSend: this.pendingSend,
//     }
//   }
// }

// Stopped
// Paused?
