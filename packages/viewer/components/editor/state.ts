import { uniqueId } from "lodash"
import { S, createState, createDesign } from "@state-designer/core"

export type Event = {
  id: string
  name: string
}

export enum TransitionType {
  Normal = "normal",
  Previous = "previous",
  Restore = "restore",
}

export type EventHandler = {
  id: string
  event: string // id
  to?: string // state id
  transitionType: TransitionType
}

export type State = {
  id: string
  parent?: string
  name: string
  eventHandlers: Map<string, EventHandler>
  initial?: string
  states: Set<string>
}

type InitialData = {
  selection: {
    state?: string
  }
  events: Map<string, Event>
  states: Map<string, State>
}

const initialData: InitialData = {
  selection: {
    state: undefined,
  },
  events: new Map([
    [
      "toggled",
      {
        id: "toggled",
        name: "TOGGLED",
      },
    ],
    [
      "opened",
      {
        id: "opened",
        name: "OPENED",
      },
    ],
    [
      "closed",
      {
        id: "closed",
        name: "CLOSED",
      },
    ],
  ]),
  states: new Map([
    [
      "root",
      {
        id: "root",
        name: "Root",
        initial: "toggled off",
        eventHandlers: new Map(),
        states: new Set(["toggled off", "toggled on"]),
      },
    ],
    [
      "toggled off",
      {
        id: "toggled off",
        name: "Toggled Off",
        parent: "root",
        eventHandlers: new Map([
          [
            "toggled",
            {
              id: "on_toggled",
              event: "toggled", // id
              to: "toggled on",
              transitionType: TransitionType.Normal,
            },
          ],
        ]),
        initial: undefined,
        states: new Set([]),
      },
    ],
    [
      "toggled on",
      {
        id: "toggled on",
        name: "Toggled On",
        parent: "root",
        eventHandlers: new Map([
          [
            "toggled",
            {
              id: "on_toggled",
              event: "toggled", // id
              to: "toggled off",
              transitionType: TransitionType.Normal,
            },
          ],
        ]),
        initial: undefined,
        states: new Set([]),
      },
    ],
  ]),
}

const global = createState({
  data: initialData,
  on: {
    // Editor
    SELECTED_STATE: "setSelectedState",
    DESELECTED_STATE: "clearSelectedState",
    // Events
    ADDED_EVENT: "addEvent",
    UPDATED_EVENT_NAME: "updateEvent",
    DELETED_EVENT: ["deleteEventHandlers", "deleteEvent"],
    // State
    CREATED_STATE: "createState",
    UPDATED_STATE_NAME: "updateState",
    UPDATED_STATE_EVENTS: "updateState",
    DELETED_STATE: "deleteState",
    SET_INITIAL_STATE_ON_STATE: "setInitialState",
    // State Event Handlers
    ADDED_EVENT_HANDLER_TO_STATE: "addEventHandlerToState",
    CHANGED_EVENT_HANDLER_ON_STATE: "updateEventHandler",
    DELETED_EVENT_HANDLER_FROM_STATE: "deleteEventHandlerFromState",
    SET_EVENT_HANDLER_TARGET: "setEventHandlerTarget",
    SET_HANDLER_TRANSITION_TYPE: "setEventHandlerTransitionType",
  },
  actions: {
    // Selection
    setSelectedState(data, stateId) {
      data.selection.state = stateId
    },
    clearSelectedState(data) {
      data.selection.state = undefined
    },
    // Events
    addEvent(data, name) {
      const id = uniqueId()
      data.events.set(id, {
        id,
        name,
      })
    },
    updateEvent(data, event: Event) {
      data.events.set(event.id, event)
    },
    deleteEvent(data, eventId: string) {
      data.events.delete(eventId)
    },
    // States
    createState(data, { stateId, name }) {
      const id = uniqueId()

      const s = data.states.get(stateId)
      s.states.add(id)

      data.states.set(id, {
        id,
        name,
        parent: stateId,
        eventHandlers: new Map(),
        initial: undefined,
        states: new Set([]),
      })
    },
    setInitialState(data, { stateId, initialId }) {
      const s = data.states.get(stateId)
      s.initial = initialId
    },
    updateState(data, state: State) {
      data.states.set(state.id, state)
    },
    deleteState(data, stateId: string) {
      const s = data.states.get(stateId)
      const p = data.states.get(s.parent)

      if (p !== undefined) {
        p.states.delete(stateId)
      }

      data.states.delete(stateId)
    },
    // Event Handlers
    setEventHandlerTarget(data, { stateId, eventId, targetId }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)
      e.to = targetId
    },
    setEventHandlerTransitionType(data, { stateId, eventId, type }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)
      e.transitionType = type
    },
    updateEventHandler(data, { stateId, fromId, toId }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(fromId)
      s.eventHandlers.set(toId, {
        id: e.id,
        event: toId,
        to: e.to,
        transitionType: TransitionType.Normal,
      })
      s.eventHandlers.delete(fromId)
    },
    deleteEventHandlers(data, eventId: string) {
      data.states.forEach((state) => {
        state.eventHandlers.delete(eventId)
      })
    },
    addEventHandlerToState(data, { stateId, eventId }) {
      const s = data.states.get(stateId)
      s.eventHandlers.set(eventId, {
        id: uniqueId(),
        event: eventId,
        to: undefined,
        transitionType: TransitionType.Normal,
      })
    },
    deleteEventHandlerFromState(data, { stateId, eventId }) {
      const s = data.states.get(stateId)
      s.eventHandlers.delete(eventId)
    },
  },
  values: {
    editingState(data) {
      return data.states.get(data.selection.state)
    },
    states(data) {
      return Array.from(data.states.values())
    },
    events(data) {
      return Array.from(data.events.values())
    },
    simulation(data) {
      const root = data.states.get("root")

      function getDecorator(type: TransitionType) {
        if (type === TransitionType.Normal) return ""
        if (type === TransitionType.Previous) return ".previous"
        if (type === TransitionType.Restore) return ".restore"
      }

      function getEventHandler(handler: EventHandler) {
        const event = data.events.get(handler.event)
        const decorator = getDecorator(handler.transitionType)
        return [
          event.name,
          {
            to: data.states.get(handler.to)?.name + decorator,
          },
        ] as const
      }

      function getState(state: State) {
        const eventHandlers = Array.from(state.eventHandlers.values()).map(
          getEventHandler
        )

        return [
          state.name,
          {
            initial: data.states.get(state.initial)?.name,
            on: Object.fromEntries(eventHandlers),
            states: Object.fromEntries(
              Array.from(state.states.values()).map((stateId) =>
                getState(data.states.get(stateId))
              )
            ),
          },
        ] as const
      }

      const [_, rootState] = getState(root)

      return createState({
        initial: data.states.get(root.initial)?.name,
        on: rootState.on,
        states: rootState.states,
      })
    },
  },
})

export default global
