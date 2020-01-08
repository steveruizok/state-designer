import { StateDesigner } from "state-designer"
import { uniqueId, getLocalSavedData } from "../Utils"
import sortBy from "lodash/sortBy"
import * as DS from "../interfaces/index"

import { Collections } from "./Collections"

export function createStateCollection(getNewState: (id: string) => DS.State) {
  const initial = getNewState("initial")
  initial.events = ["initial"]
  initial.index = 0

  let storedData = getLocalSavedData("DS_States", [])

  let data: Map<string, DS.State> = new Map(storedData)

  const designer = new StateDesigner({
    data,
    on: {
      CREATE: {
        get: "newState",
        do: "addState",
      },
      EDIT: {
        get: "state",
        do: "editState",
      },
      MOVE: {
        get: "state",
        do: "moveState",
      },
      REMOVE: {
        do: "removeState",
      },
      // Events
      CREATE_EVENT: {
        get: "state",
        do: "createEvent",
      },
      EDIT_EVENT: {
        get: "state",
        do: "editEvent",
      },
      MOVE_EVENT: {
        get: "state",
        do: "moveEvent",
      },
      DUPLICATE_EVENT: {
        get: "state",
        do: "duplicateEvent",
      },
      REMOVE_EVENT: {
        get: "state",
        do: "removeEvent",
      },
    },
    results: {
      newState: (data, id = uniqueId()) => {
        const state = getNewState(id)
        state.index = data.size
        return state
      },
      state: (data, { id }) => data.get(id),
    },
    actions: {
      // Event
      createEvent(data, _, state: DS.State) {
        const id = uniqueId()
        state.events.push(id)
        Collections.events.send("CREATE", { id })
      },
      moveEvent(data, { eventId, target }, state: DS.State) {
        const index = state.events.indexOf(eventId)
        console.log(index, target)
        state.events.splice(index, 1)
        state.events.splice(target, 0, eventId)
      },
      editEvent(data, { eventId, changes }) {
        Collections.events.send("EDIT", { eventId, changes })
      },
      duplicateEvent(data, { eventId }, state: DS.State) {
        const id = uniqueId()
        Collections.events.send("CREATE", { id })
        const dupe = Collections.events.data.get(id)
        const source = Collections.events.data.get(eventId)
        if (!dupe || !source) return
        Object.assign(dupe, source)
        dupe.id = id
        dupe.index = Collections.events.data.size
        state.events.push(id)
      },
      removeEvent(data, { eventId }, state: DS.State) {
        const index = state.events.indexOf(eventId)
        Collections.events.send("REMOVE", { id: eventId })
        state.events.splice(index, 1)
      },
      // State
      addState(data, _, state) {
        data.set(state.id, state)
      },
      removeState(data, { id }) {
        data.delete(id)
      },
      editState(_, { changes }, state: DS.State) {
        Object.assign(state, changes)
      },
      moveState(data, { target }, state: DS.State) {
        if (target === state.index) return

        const states = sortBy(Array.from(data.values()), "index")

        for (let o of states) {
          if (o === state) continue

          if (target < state.index) {
            if (o.index >= target && o.index < state.index) {
              o.index++
            }
          } else {
            if (o.index <= target && o.index > state.index) {
              o.index--
            }
          }
        }

        state.index = target
      },
    },
    conditions: {},
  })

  designer.subscribe((active, data) => {
    const items = JSON.stringify(Array.from(data.entries()), null, 2)
    localStorage.setItem("DS_States", items)
  })

  return designer
}
