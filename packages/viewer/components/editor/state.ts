import { uniqueId } from "lodash"
import { S, createState, createDesign } from "@state-designer/core"

export type Event = {
  id: string
  name: string
}

export type EventHandler = {
  id: string
  event: string // id
  to?: string // state id
}

export type State = {
  id: string
  name: string
  eventHandlers: Map<string, EventHandler>
  initial: boolean
}

type InitialData = {
  events: Map<string, Event>
  states: Map<string, State>
}

const initialData: InitialData = {
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
      "example",
      {
        id: "example",
        name: "Example",
        eventHandlers: new Map(),
        initial: true,
      },
    ],
  ]),
}

const global = createState({
  data: initialData,
  on: {
    ADDED_EVENT: "addEvent",
    UPDATED_EVENT_NAME: "updateEvent",
    DELETED_EVENT: "deleteEvent",
    ADDED_STATE: "addState",
    // State
    UPDATED_STATE_NAME: "updateState",
    UPDATED_STATE_EVENTS: "updateState",
    DELETED_STATE: "deleteState",
    // State Event Handlers
    ADDED_EVENT_HANDLER_TO_STATE: "addEventHandlerToState",
    DELETED_EVENT_HANDLER_FROM_STATE: "deleteEventHandlerFromState",
  },
  actions: {
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
    deleteEvent(data, id: string) {
      data.events.delete(id)
    },
    // States
    addState(data, name) {
      const id = uniqueId()
      data.states.set(id, {
        id,
        name,
        eventHandlers: new Map(),
        initial: data.states.size === 0,
      })
    },
    updateState(data, state: State) {
      data.states.set(state.id, state)
    },
    deleteState(data, id: string) {
      data.states.delete(id)
    },
    // Event Handlers
    addEventHandlerToState(data, { stateId, eventId }) {
      const s = data.states.get(stateId)
      s.eventHandlers.set(eventId, {
        id: uniqueId(),
        event: eventId,
        to: undefined,
      })
    },
    deleteEventHandlerFromState(data, { stateId, eventId }) {
      const s = data.states.get(stateId)
      s.eventHandlers.delete(eventId)
    },
  },
  values: {
    states(data) {
      return Array.from(data.states.values())
    },
    events(data) {
      return Array.from(data.events.values())
    },
  },
})

export default global
