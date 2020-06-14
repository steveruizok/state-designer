import { uniqueId, sortBy } from "lodash"
import { createState, S } from "@state-designer/core"

export type Id<T extends { id: string }> = T["id"]

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

export type SendEvent = {
  id: string
  index: number
  name: string
}

export type StateBranch = {
  state: State
  isInitial: boolean
  isFirst: boolean
  isLast: boolean
  children?: StateBranch[]
}

export type EventHandler = {
  id: string
  index: number
  event: string // id
  chain: Map<string, HandlerLink>
}

export enum TransitionType {
  Normal = "normal",
  Previous = "previous",
  Restore = "restore",
}

export type HandlerLink = {
  id: string
  index: number
  to?: Id<State> // state id
  do: Id<Action>[] // action id
  if: Id<Condition>[] // condition id
  transitionType: TransitionType
}

export type State = {
  id: string
  index: number
  parent?: Id<State>
  depth: number
  name: string
  eventHandlers: Map<string, EventHandler>
  initial?: Id<State>
  states: Set<string>
}

type Results = {
  state: State
  event: SendEvent
  eventHandler: EventHandler
  eventHandlers: EventHandler[]
  link: HandlerLink
  links: HandlerLink[]
}

type InitialData = {
  data: string
  selection: {
    state?: Id<State>
  }
  events: Map<string, SendEvent>
  states: Map<string, State>
  actions: Map<string, Action>
  conditions: Map<string, Condition>
}

const initialData: InitialData = {
  selection: {
    state: "root",
  },
  data: `{
  count: 0
}`,
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
        index: 1,
        name: "decrementCount",
        code: `data.count--`,
      },
    ],
  ]),
  conditions: new Map([
    [
      "cond1",
      {
        id: "cond1",
        index: 0,
        name: "countIsBelowMax",
        code: `return data.count < 5`,
      },
    ],
    [
      "cond2",
      {
        id: "cond2",
        index: 1,
        name: "countIsAboveMin",
        code: `return data.count > 0`,
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
      "incremented",
      {
        id: "incremented",
        index: 1,
        name: "INCREMENTED",
      },
    ],
    [
      "decremented",
      {
        id: "decremented",
        index: 2,
        name: "DECREMENTED",
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
        states: new Set(["toggled off", "toggled on"]),
        eventHandlers: new Map([
          [
            "incremented",
            {
              id: "on_incremented",
              index: 0,
              event: "incremented", // id
              chain: new Map([
                [
                  "l0",
                  {
                    id: "l0",
                    index: 0,
                    to: undefined,
                    if: ["cond1"],
                    do: ["action1"],
                    transitionType: TransitionType.Normal,
                  },
                ],
              ]),
            },
          ],
          [
            "decremented",
            {
              id: "on_decremented",
              index: 1,
              event: "decremented", // id
              chain: new Map([
                [
                  "l0",
                  {
                    id: "l0",
                    index: 0,
                    to: undefined,
                    if: ["cond2"],
                    do: ["action2"],
                    transitionType: TransitionType.Normal,
                  },
                ],
              ]),
            },
          ],
        ]),
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
              chain: new Map(),
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
                    if: [],
                    do: [],
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
    // Data
    CHANGED_DATA: "saveData",
    // Events
    ADDED_EVENT: "addEvent",
    CHANGED_EVENT_NAME: { get: "event", do: "updateEventName" },
    MOVED_EVENT: { get: "event", do: "moveEvent" },
    DELETED_EVENT: ["deleteEventHandlers", "deleteEvent"],
    // State
    CREATED_STATE: "createState",
    CHANGED_STATE_NAME: { get: "state", do: "updateStateName" },
    MOVED_STATE: { get: "state", do: "moveStateInParentStates" },
    SET_INITIAL_STATE_ON_STATE: { get: "state", do: "setInitialState" },
    DELETED_STATE: "deleteState",
    // Event Handlers
    ADDED_EVENT_HANDLER_TO_STATE: {
      get: "state",
      do: "addEventHandlerToState",
    },
    CHANGED_EVENT_HANDLER: { get: "eventHandler", do: "changeEventHandler" },
    MOVED_EVENT_HANDLER: { get: "eventHandler", do: "moveEventHandler" },
    DELETED_EVENT_HANDLER_FROM_STATE: {
      get: "state",
      do: "deleteEventHandlerFromState",
    },
    // Handler Links
    CREATED_LINK: { get: "eventHandler", do: "createLink" },
    MOVED_LINK: { get: "handlerLink", do: "moveLink" },
    SET_LINK_TRANSITION_TARGET: {
      get: "handlerLink",
      do: "setLinkTransitionTarget",
    },
    SET_LINK_TRANSITION_TYPE: {
      get: "handlerLink",
      do: "setLinkTransitionType",
    },
    DELETED_LINK: { get: "eventHandler", do: "deleteLink" },
    CHANGED_LINK_ACTION: {
      get: "handlerLink",
      if: "idIsEmpty",
      do: "deleteChangedLinkAction",
      else: "changeLinkAction",
    },
    ADDED_LINK_ACTION: { get: "handlerLink", do: "addLinkAction" },
    CHANGED_LINK_CONDITION: {
      if: "idIsEmpty",
      get: "handlerLink",
      do: "deleteChangedLinkCondition",
      else: "changeLinkCondition",
    },
    ADDED_LINK_CONDITION: { get: "handlerLink", do: "addLinkCondition" },
    // Actions
    CREATED_ACTION: "createAction",
    MOVED_ACTION: { get: "action", do: "moveEventFn" },
    CHANGED_ACTION_NAME: { get: "action", do: "setEventFnName" },
    CHANGED_ACTION_CODE: { get: "action", do: "setEventFnCode" },
    DELETED_ACTION: "deleteAction",
    // Conditions
    CREATED_CONDITION: "createCondition",
    MOVED_CONDITION: { get: "condition", do: "moveEventFn" },
    CHANGED_CONDITION_NAME: { get: "condition", do: "setEventFnName" },
    CHANGED_CONDITION_CODE: { get: "condition", do: "setEventFnCode" },
    DELETED_CONDITION: "deleteCondition",
  },
  results: {
    state(data, { stateId }) {
      const state = data.states.get(stateId)
      const eventHandlers = sortBy(
        Array.from(state.eventHandlers.values()),
        "index"
      )
      return { state, eventHandlers }
    },
    event(data, { eventId }) {
      return { event: data.events.get(eventId) }
    },
    eventHandler(data, { stateId, eventId }) {
      const state = data.states.get(stateId)
      const eventHandlers = sortBy(
        Array.from(state.eventHandlers.values()),
        "index"
      )
      const eventHandler = state.eventHandlers.get(eventId)
      return { state, eventHandler, eventHandlers }
    },
    handlerLinks(data, { stateId, eventId }) {
      const state = data.states.get(stateId)
      const eventHandlers = sortBy(
        Array.from(state.eventHandlers.values()),
        "index"
      )
      const eventHandler = state.eventHandlers.get(eventId)
      const links = sortBy(Array.from(eventHandler.chain.values()), "index")
      return { state, eventHandler, eventHandlers, links }
    },
    handlerLink(data, { stateId, eventId, linkId }) {
      const state = data.states.get(stateId)
      const eventHandlers = sortBy(
        Array.from(state.eventHandlers.values()),
        "index"
      )
      const eventHandler = state.eventHandlers.get(eventId)
      const link = eventHandler.chain.get(linkId)
      const links = sortBy(Array.from(eventHandler.chain.values()), "index")
      return { state, eventHandler, eventHandlers, link, links }
    },
    action(data, { id }) {
      const fn = data.actions.get(id)
      const fns = sortBy(Array.from(data.actions.values()), "index")
      return { fn, fns }
    },
    condition(data, { id }) {
      const fn = data.conditions.get(id)
      const fns = sortBy(Array.from(data.conditions.values()), "index")
      return { fn, fns }
    },
  },
  conditions: {
    idIsEmpty(_, { id }) {
      return id === ""
    },
  },
  actions: {
    // Data
    saveData(data, dataString: string) {
      data.data = dataString
    },
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
    moveEvent(data, { eventId, delta }, { event }: Results) {
      const events = sortBy(Array.from(data.events.values()), "index")

      events.splice(event.index, 1)
      events.splice(event.index + delta, 0, event)
      events.forEach((event, i) => (event.index = i))
    },
    updateEventName(data, { eventId, name }, { event }: Results) {
      const e = data.events.get(eventId)
      e.name = name
    },
    deleteEvent(data, { eventId }, { event }: Results) {
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
    setInitialState(data, { initialId }, { state }: Results) {
      state.initial = initialId
    },
    updateStateName(data, { name }, { state }: Results) {
      state.name = name
    },
    updateState(data, { name }, { state }: Results) {
      state.name = name
    },
    moveState(data, { delta }, { state }: Results) {
      const states = sortBy(Array.from(data.states.values()), "index")
      states.splice(state.index, 1)
      states.splice(state.index + delta, 0, state)
      states.forEach((state, i) => (state.index = i))
    },
    moveStateInParentStates(data, { delta }, { state }: Results) {
      const p = data.states.get(state.parent)

      const states = sortBy(
        Array.from(p.states.keys()).map((id) => data.states.get(id)),
        "index"
      )
      states.splice(state.index, 1)
      states.splice(state.index + delta, 0, state)
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
    addEventHandlerToState(_, { eventId }, { state }: Results) {
      const linkId = uniqueId()
      state.eventHandlers.set(eventId, {
        id: uniqueId(),
        index: state.eventHandlers.size,
        event: eventId,
        chain: new Map([
          [
            linkId,
            {
              id: linkId,
              index: 0,
              if: [],
              do: [],
              to: undefined,
              transitionType: TransitionType.Normal,
            },
          ],
        ]),
      })
    },
    changeEventHandler(_, { id }, { state, eventHandler }: Results) {
      state.eventHandlers.delete(eventHandler.event)
      eventHandler.event = id
      state.eventHandlers.set(id, eventHandler)
    },
    moveEventHandler(_, { delta }, { eventHandlers, eventHandler }: Results) {
      eventHandlers.splice(eventHandler.index, 1)
      eventHandlers.splice(eventHandler.index + delta, 0, eventHandler)
      eventHandlers.forEach((h, i) => (h.index = i))
    },
    deleteEventHandlerFromState(_, { eventId }, { state }: Results) {
      state.eventHandlers.delete(eventId)
    },
    deleteEventHandlers(data, { eventId }) {
      data.states.forEach((state) => {
        state.eventHandlers.delete(eventId)
      })
    },

    // Event Handler Links (Handler Objects in the Event Handler Chain)
    createLink(_, __, { eventHandler }: Results) {
      const id = uniqueId()
      eventHandler.chain.set(id, {
        id,
        index: eventHandler.chain.size,
        to: undefined,
        do: [],
        if: [],
        transitionType: TransitionType.Normal,
      })
    },
    moveLink(_, { delta }, { link, links }: Results) {
      links.splice(link.index, 1)
      links.splice(link.index + delta, 0, link)
      links.forEach((link, i) => (link.index = i))
    },
    deleteLink(_, { linkId }, { eventHandler }: Results) {
      eventHandler.chain.delete(linkId)
    },
    setLinkTransitionTarget(_, { id }, { link }: Results) {
      link.to = id
    },
    setLinkTransitionType(_, { type }, { link }: Results) {
      link.transitionType = type
    },
    // Conditions
    changeLinkCondition(_, { id, index }, { link }: Results) {
      link.if[index] = id
    },
    deleteChangedLinkCondition(_, { id }, { link }: Results) {
      link.if.splice(link.if.indexOf(id), 1)
    },
    addLinkCondition(_, { id }, { link }: Results) {
      link.if.push(id)
    },
    // Actions
    changeLinkAction(_, { index, id }, { link }: Results) {
      link.do[index] = id
    },
    deleteChangedLinkAction(_, { id }, { link }: Results) {
      link.do.splice(link.do.indexOf(id), 1)
    },
    addLinkAction(_, { id }, { link }: Results) {
      link.do.push(id)
    },
    // Event Functions
    setEventFnName(_, { name }, { fn }) {
      fn.name = name
    },
    setEventFnCode(_, { code }, { fn }) {
      fn.code = code
    },
    moveEventFn(
      _,
      { delta },
      { fn, fns }: { fn: EventFunction; fns: EventFunction[] }
    ) {
      fns.splice(fn.index, 1)
      fns.splice(fn.index + delta, 0, fn)
      fns.forEach((fn, i) => (fn.index = i))
    },
    // Actions
    createAction(data, name) {
      const id = uniqueId()
      data.actions.set(id, {
        id,
        index: data.actions.size,
        name,
        code: "",
      })
    },
    deleteAction(data, { id }) {
      data.actions.delete(id)

      data.states.forEach((state) =>
        state.eventHandlers.forEach((handler) =>
          handler.chain.forEach(
            (link) => (link.do = link.do.filter((_id) => _id !== id))
          )
        )
      )
    },
    // Conditions
    createCondition(data, name) {
      const id = uniqueId()
      data.conditions.set(id, {
        id,
        index: data.conditions.size,
        name,
        code: "return true",
      })
    },
    deleteCondition(data, { id }) {
      data.conditions.delete(id)

      data.states.forEach((state) =>
        state.eventHandlers.forEach((handler) =>
          handler.chain.forEach(
            (link) => (link.if = link.if.filter((_id) => _id !== id))
          )
        )
      )
    },
  },
  values: {
    editingState(data) {
      return data.states.get(data.selection.state)
    },
    stateTree(data) {
      function getStateNode(id: string): StateBranch {
        const node = data.states.get(id)
        const parent = data.states.get(node.parent)
        const isInitial = parent ? parent.initial === node.id : true
        const children = sortBy(
          Array.from(node.states.values()).map((id) => getStateNode(id)),
          "state.index"
        )
        return {
          state: node,
          children,
          isInitial,
          isFirst: parent ? node.index === 0 : false,
          isLast: parent ? node.index === parent.states.size - 1 : false,
        }
      }

      return getStateNode("root")
    },
    states(data) {
      return getIndexSortedValues(data.states)
    },
    events(data) {
      return getIndexSortedValues(data.events)
    },
    actions(data) {
      return getIndexSortedValues(data.actions)
    },
    conditions(data) {
      return getIndexSortedValues(data.conditions)
    },
    data(d) {
      return Function(`return ${d.data}`)()
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
          if: link.if.map((id) => data.conditions.get(id).name),
          do: link.do.map((id) => data.actions.get(id).name),
          to: link.to ? data.states.get(link.to).name + decorator : undefined,
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

      function getData(data: string) {
        return Function(`return ${data}`)()
      }

      function getCollection(
        collection: Map<string, EventFunction>
      ): { [key: string]: any } {
        return Object.fromEntries(
          getIndexSortedValues(collection).map((fn) => {
            const eventFn = Function(
              "data",
              "payload",
              "result",
              fn.code
            ) as any

            Object.defineProperty(eventFn, "name", {
              value: fn.name,
              writable: false,
            })

            return [fn.name, eventFn]
          })
        )
      }

      const [_, rootState] = getState(root)

      let fData: any = {}

      try {
        fData = getData(data.data)
      } catch (e) {
        console.log("Error in data", e.message)
      }

      const finalState = createState({
        data: fData,
        initial: data.states.get(root.initial)?.name,
        on: rootState.on,
        states: rootState.states,
        conditions: getCollection(data.conditions),
        actions: getCollection(data.actions),
      })

      return finalState
    },
  },
})

export default global

function getIndexSortedValues<T>(source: Map<string, T> | Set<T>) {
  return sortBy(Array.from(source.values()), "index")
}
