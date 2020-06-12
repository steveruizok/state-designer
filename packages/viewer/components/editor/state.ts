import { uniqueId, sortBy } from "lodash"
import { createState } from "@state-designer/core"

export interface EventFunction {
  id: string
  index: number
  name: string
  code: string
}

export interface Action extends EventFunction {}

export interface Condition extends EventFunction {}

export interface Result extends EventFunction {}

export interface Time extends EventFunction {}

export interface Value extends EventFunction {}

export type Event = {
  id: string
  index: number
  name: string
}

export enum TransitionType {
  Normal = "normal",
  Previous = "previous",
  Restore = "restore",
}

export type EventHandler = {
  id: string
  index: number
  event: string // id
  chain: Map<string, HandlerLink>
}

export type HandlerLink = {
  id: string
  index: number
  to?: string // state id
  do?: string[]
  transitionType: TransitionType
}

export type State = {
  id: string
  index: number
  parent?: string
  depth: number
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
  actions: Map<string, Action>
}

const initialData: InitialData = {
  selection: {
    state: undefined,
  },
  actions: new Map([
    [
      "action1",
      {
        id: "action1",
        index: 0,
        name: "incrementCount",
        code: `data.count++`,
      },
    ],
    [
      "action2",
      {
        id: "action2",
        index: 0,
        name: "decrementCount",
        code: `data.count--`,
      },
    ],
  ]),
  events: new Map([
    [
      "toggled",
      {
        id: "toggled",
        index: 0,
        name: "TOGGLED",
      },
    ],
    [
      "opened",
      {
        id: "opened",
        index: 1,
        name: "OPENED",
      },
    ],
    [
      "closed",
      {
        id: "closed",
        index: 2,
        name: "CLOSED",
      },
    ],
  ]),
  states: new Map([
    [
      "root",
      {
        id: "root",
        index: 0,
        depth: 0,
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
        index: 0,
        depth: 1,
        name: "Toggled Off",
        parent: "root",
        eventHandlers: new Map([
          [
            "toggled",
            {
              id: "on_toggled",
              index: 0,
              event: "toggled", // id
              chain: new Map([
                [
                  "t1",
                  {
                    id: "t1",
                    index: 0,
                    to: "toggled on",
                    do: ["action1"],
                    transitionType: TransitionType.Normal,
                  },
                ],
              ]),
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
        index: 1,
        depth: 1,
        name: "Toggled On",
        parent: "root",
        eventHandlers: new Map([
          [
            "toggled",
            {
              id: "on_toggled",
              index: 0,
              event: "toggled", // id
              chain: new Map([
                [
                  "t2",
                  {
                    id: "t2",
                    index: 0,
                    to: "toggled off",
                    transitionType: TransitionType.Normal,
                  },
                ],
              ]),
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
    UPDATED_EVENT_NAME: "updateEventName",
    MOVED_EVENT: "moveEvent",
    DELETED_EVENT: ["deleteEventHandlers", "deleteEvent"],
    // State
    CREATED_STATE: "createState",
    UPDATED_STATE_NAME: "updateStateName",
    MOVED_STATE: "moveStateInParentStates",
    DELETED_STATE: "deleteState",
    SET_INITIAL_STATE_ON_STATE: "setInitialState",
    // Event Handlers
    ADDED_EVENT_HANDLER_TO_STATE: "addEventHandlerToState",
    MOVED_EVENT_HANDLER: "moveEventHandler",
    DELETED_EVENT_HANDLER_FROM_STATE: "deleteEventHandlerFromState",
    // Handler Links
    CREATED_LINK: "createLink",
    MOVED_LINK: "moveLink",
    SET_LINK_TRANSITION_TARGET: "setLinkTransitionTarget",
    SET_LINK_TRANSITION_TYPE: "setLinkTransitionType",
    DELETED_LINK: "deleteLink",
    // Actions
    CHANGED_LINK_ACTION: {
      if: "toIdIsEmpty",
      do: "deleteChangedLinkAction",
      else: "changeLinkAction",
    },
    ADDED_LINK_ACTION: "addLinkAction",
  },
  conditions: {
    toIdIsEmpty(_, { toId }) {
      return toId === ""
    },
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
        index: data.events.size,
      })
    },
    moveEvent(data, { eventId, delta }) {
      const e = data.events.get(eventId)

      const events = sortBy(Array.from(data.events.values()), "index")

      events.splice(e.index, 1)
      events.splice(e.index + delta, 0, e)
      events.forEach((event, i) => (event.index = i))
    },
    updateEventName(data, { eventId, name }) {
      const e = data.events.get(eventId)
      e.name = name
    },
    deleteEvent(data, { eventId }) {
      data.events.delete(eventId)
    },
    // States
    createState(data, { stateId, name }) {
      const id = uniqueId()

      const p = data.states.get(stateId)

      data.states.set(id, {
        id,
        index: p.states.size,
        depth: p.depth + 1,
        name,
        parent: stateId,
        eventHandlers: new Map(),
        initial: undefined,
        states: new Set([]),
      })

      p.states.add(id)
    },
    setInitialState(data, { stateId, initialId }) {
      const s = data.states.get(stateId)
      s.initial = initialId
    },
    updateStateName(data, { stateId, name }) {
      const s = data.states.get(stateId)
      s.name = name
    },
    updateState(data, { stateId, name }) {
      const s = data.states.get(stateId)
      s.name = name
    },
    moveState(data, { stateId, delta }) {
      const s = data.states.get(stateId)

      const states = sortBy(Array.from(data.states.values()), "index")
      states.splice(s.index, 1)
      states.splice(s.index + delta, 0, s)
      states.forEach((state, i) => (state.index = i))
    },
    moveStateInParentStates(data, { stateId, delta }) {
      const s = data.states.get(stateId)
      const p = data.states.get(s.parent)

      const states = sortBy(
        Array.from(p.states.keys()).map((id) => data.states.get(id)),
        "index"
      )
      states.splice(s.index, 1)
      states.splice(s.index + delta, 0, s)
      states.forEach((state, i) => (state.index = i))
    },
    deleteState(data, { stateId }) {
      const s = data.states.get(stateId)
      const p = data.states.get(s.parent)

      if (p !== undefined) {
        p.states.delete(stateId)

        const states = sortBy(
          Array.from(p.states.keys()).map((id) => data.states.get(id)),
          "index"
        )
        states.forEach((state, i) => (state.index = i))
      }

      data.states.delete(stateId)
    },

    // Event Handlers
    addEventHandlerToState(data, { stateId, eventId }) {
      const s = data.states.get(stateId)
      const linkId = uniqueId()
      s.eventHandlers.set(eventId, {
        id: uniqueId(),
        index: s.eventHandlers.size,
        event: eventId,
        chain: new Map([
          [
            linkId,
            {
              id: linkId,
              index: 0,
              to: undefined,
              transitionType: TransitionType.Normal,
            },
          ],
        ]),
      })
    },
    moveEventHandler(data, { stateId, eventId, delta }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)

      const handlers = sortBy(Array.from(s.eventHandlers.values()), "index")
      handlers.splice(e.index, 1)
      handlers.splice(e.index + delta, 0, e)
      handlers.forEach((h, i) => (h.index = i))
    },
    deleteEventHandlerFromState(data, { stateId, eventId }) {
      const s = data.states.get(stateId)
      s.eventHandlers.delete(eventId)
    },
    deleteEventHandlers(data, { eventId }) {
      data.states.forEach((state) => {
        state.eventHandlers.delete(eventId)
      })
    },

    // Event Handler Links (Handler Objects in the Event Handler Chain)
    createLink(data, { stateId, eventId }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)
      const id = uniqueId()
      e.chain.set(id, {
        id: id,
        index: e.chain.size,
        to: undefined,
        transitionType: TransitionType.Normal,
      })
    },
    moveLink(data, { stateId, eventId, linkId, delta }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)
      const l = e.chain.get(linkId)

      const links = sortBy(Array.from(e.chain.values()), "index")

      links.splice(l.index, 1)
      links.splice(l.index + delta, 0, l)
      links.forEach((link, i) => (link.index = i))
    },
    deleteLink(data, { stateId, eventId, linkId }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)

      e.chain.delete(linkId)
    },
    setLinkTransitionTarget(data, { stateId, eventId, linkId, targetId }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)
      const l = e.chain.get(linkId)

      l.to = targetId
    },
    setLinkTransitionType(data, { stateId, eventId, linkId, type }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)
      const l = e.chain.get(linkId)

      l.transitionType = type
    },
    changeLinkAction(data, { stateId, eventId, linkId, toId, index }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)
      const l = e.chain.get(linkId)

      l.do[index] = toId
    },
    deleteChangedLinkAction(data, { stateId, eventId, linkId, fromId }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)
      const l = e.chain.get(linkId)

      l.do.splice(l.do.indexOf(fromId), 1)
    },
    addLinkAction(data, { stateId, eventId, linkId, actionId }) {
      const s = data.states.get(stateId)
      const e = s.eventHandlers.get(eventId)
      const l = e.chain.get(linkId)

      l.do.push(actionId)
    },
  },
  values: {
    editingState(data) {
      return data.states.get(data.selection.state)
    },
    states(data) {
      return sortBy(Array.from(data.states.values()), "index")
    },
    events(data) {
      return sortBy(Array.from(data.events.values()), "index")
    },
    simulation(data) {
      const root = data.states.get("root")

      function getDecorator(type: TransitionType) {
        if (type === TransitionType.Normal) return ""
        if (type === TransitionType.Previous) return ".previous"
        if (type === TransitionType.Restore) return ".restore"
      }

      function getLink(link: HandlerLink) {
        const decorator = getDecorator(link.transitionType)
        return {
          to: data.states.get(link.to)?.name + decorator,
        }
      }

      function getEventHandler(handler: EventHandler) {
        const event = data.events.get(handler.event)

        return [
          event.name,
          Array.from(handler.chain.values()).map((link) => getLink(link)),
        ] as const
      }

      function getState(state: State) {
        const eventHandlers = sortBy(
          Array.from(state.eventHandlers.values()),
          "index"
        ).map(getEventHandler)

        return [
          state.name,
          {
            initial: data.states.get(state.initial)?.name,
            on: Object.fromEntries(eventHandlers),
            states: Object.fromEntries(
              sortBy(
                Array.from(state.states.values()).map((stateId) =>
                  data.states.get(stateId)
                ),
                "index"
              ).map(getState)
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
