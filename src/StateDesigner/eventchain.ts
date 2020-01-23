import { IEvent, IStateNode, IEventHandler } from "./index"
import produce, { Draft } from "immer"

type TransitionRecord<D> = {
  target: IStateNode<D, any, any, any>
  previous: boolean
  restore: boolean
}

export type EventRecord<D> = {
  send: boolean
  action: boolean
  transition?: TransitionRecord<D>
  transitions: number
}

export class Eventchain<D, P> {
  private record: EventRecord<D> = {
    send: false,
    action: false,
    transition: undefined,
    transitions: 0
  }

  data: D

  constructor(data: D) {
    this.data = data
  }

  send(
    activeStates: IStateNode<D, any, any, any>[],
    eventName: string,
    payload: P
  ) {
    const dataResult = produce(this.data, draft => {
      for (let state of activeStates) {
        if (this.record.send || this.record.transition) break

        this.handleEvent(state, state.events[eventName], draft, payload)

        if (this.record.transition !== undefined) {
          while (this.record.transition !== undefined) {
            this.enactTransition(this.record.transition, draft, payload)
          }

          break
        }
      }
    })

    return dataResult
  }

  handleEvent(
    state: IStateNode<D, any, any, any>,
    event: IEvent<D> | undefined,
    draft: Draft<D>,
    payload: any,
    result?: any
  ) {
    if (event === undefined) return
    for (let handler of event) {
      this.handleEventHandler(state, handler, draft, payload, result)
    }
  }

  handleEventHandler(
    state: IStateNode<D, any, any, any>,
    handler: IEventHandler<D>,
    draft: Draft<D>,
    payload: any,
    result?: any
  ) {
    const {
      do: actions,
      get: resolvers,
      await: asyncItem,
      to: transition,
      send
    } = handler

    for (let resolver of resolvers) {
      result = resolver(draft, payload, result)
    }

    if (!state.canEventHandlerRun(handler, draft, payload, result)) {
      return
    }

    for (let action of actions) {
      this.record.action = true
      action(draft, payload, result)
    }

    if (asyncItem !== undefined) {
      this.handleAsyncItem(state, asyncItem, draft, payload, result)
      return
    }

    if (transition !== undefined) {
      this.handleTransitionItem(state, transition)
      return
    }

    if (send !== undefined) {
      this.record.send = true
      this.handleSendItem(state, send)
      return
    }
  }

  handleSendItem(
    state: IStateNode<D, any, any, any>,
    send: string | [string, any]
  ) {}

  handleTransitionItem(
    state: IStateNode<D, any, any, any>,
    transition: string
  ) {
    let previous = false
    let restore = false

    if (transition.endsWith(".previous")) {
      previous = true
      transition = transition.substring(0, transition.length - 9)
    } else if (transition.endsWith(".restore")) {
      previous = true
      restore = true
      transition = transition.substring(0, transition.length - 8)
    }

    const target = state.getTargetFromTransition(transition, state)

    if (target !== undefined) {
      this.record.transition = {
        previous,
        restore,
        target
      }
    }
  }

  enactTransition(
    transition: TransitionRecord<D>,
    draft: Draft<D>,
    payload: any
  ) {
    this.record.transitions++

    if (this.record.transitions > 100) {
      this.record.transition = undefined
      return
    }

    const { target, previous, restore } = transition
    const { onEnter } = target.autoEvents

    target.active = true

    const downChanges = target.activateDown(previous, restore)
    this.handleChanges(
      target,
      downChanges,
      false,
      previous,
      restore,
      draft,
      payload
    )

    const upChanges = target.activateUp()
    this.handleChanges(
      target,
      upChanges,
      true,
      previous,
      restore,
      draft,
      payload
    )

    this.record.transition = undefined

    if (onEnter !== undefined) {
      this.handleEvent(target, onEnter, draft, payload)
    }
  }

  handleChanges(
    target: IStateNode<D, any, any, any>,
    results: IStateNode<D, any, any, any>[][],
    andUp: boolean,
    previous: boolean,
    restore: boolean,
    draft: Draft<D>,
    payload: any
  ) {
    const [activateDowns, deactivates] = results

    for (let state of deactivates) {
      state.deactivate()
    }

    for (let state of activateDowns) {
      state.active = true

      const { onEnter } = state.autoEvents
      if (onEnter !== undefined) {
        this.handleEvent(target, onEnter, draft, payload)
      }

      if (this.record.transition !== undefined) {
        this.enactTransition(this.record.transition, draft, payload)
      }

      const downChanges = state.activateDown(previous, restore)
      this.handleChanges(
        target,
        downChanges,
        false,
        previous,
        restore,
        draft,
        payload
      )

      if (andUp && state.parent !== undefined) {
        if (!state.parent.active) {
          // Activate the parent state
          state.parent.active = true
          this.handleChanges(
            state,
            state.activateUp(),
            true,
            previous,
            restore,
            draft,
            payload
          )
        }
      }
    }
  }

  handleAsyncItem(
    state: IStateNode<D, any, any, any>,
    asyncItem: <T>(data: Draft<D>, payload: any, result: any) => Promise<T>,
    draft: Draft<D>,
    payload: any,
    result: any
  ) {
    asyncItem(draft, payload, result)
      .then(resolved => {
        if (state.active) {
          if (state.autoEvents.onResolve) {
            this.triggerAutoEvent(state, "onResolve", payload, resolved)
          }
        }
      })
      .catch(rejected => {
        if (state.active) {
          if (state.autoEvents.onReject) {
            this.triggerAutoEvent(state, "onReject", payload, rejected)
          }
        }
      })
  }

  triggerAutoEvent(
    state: IStateNode<D, any, any, any>,
    eventName: string,
    payload: any,
    returned: any
  ) {
    const dataResult = produce(this.data, draft => {
      this.handleEvent(
        state,
        state.autoEvents[eventName],
        draft,
        payload,
        returned
      )

      if (this.record.transition !== undefined) {
        while (this.record.transition !== undefined) {
          this.enactTransition(this.record.transition, draft, payload)
        }
      }
    })

    return dataResult
  }
}
