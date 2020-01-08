import { StateDesigner } from "state-designer"
import { uniqueId, getLocalSavedData } from "../Utils"
import sortBy from "lodash/sortBy"
import * as DS from "../interfaces/index"
import { Collections } from "./Collections"

export function createEventCollection(getNewEvent: (id: string) => DS.Event) {
  const initial = getNewEvent("initial")
  initial.index = 0
  initial.handlers = ["initial"]

  let storedData = getLocalSavedData("DS_Events", [])

  let data: Map<string, DS.Event> = new Map(storedData)

  const designer = new StateDesigner({
    data,
    on: {
      CREATE: {
        get: "newEvent",
        do: "addEvent",
      },
      REMOVE: {
        do: "removeEvent",
      },
      EDIT: {
        get: "event",
        do: "editEvent",
      },
      MOVE: {
        get: "event",
        do: "moveEvent",
      },
      // Handlers
      CREATE_HANDLER: {
        get: "event",
        do: "createHandler",
      },
      EDIT_HANDLER: {
        get: "event",
        do: "editHandler",
      },
      MOVE_HANDLER: {
        get: "event",
        do: "moveHandler",
      },
      DUPLICATE_HANDLER: {
        get: "event",
        do: "duplicateHandler",
      },
      REMOVE_HANDLER: {
        get: "event",
        do: "removeHandler",
      },
    },
    results: {
      newEvent: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const item = getNewEvent(id)
        item.index = data.size

        return item
      },
      event: (data, { eventId }) => data.get(eventId),
    },
    actions: {
      addEvent(data, _, event: DS.Event) {
        data.set(event.id, event)
      },
      removeEvent(data, { eventId }) {
        data.delete(eventId)
      },
      editEvent(_, { changes }, event: DS.Event) {
        Object.assign(event, changes)
      },
      moveEvent(data, { target }, event: DS.Event) {
        if (target === event.index) return

        const events = sortBy(Array.from(data.values()), "index")

        for (let o of events) {
          if (o === event) continue

          if (target < event.index) {
            if (o.index >= target && o.index < event.index) {
              o.index++
            }
          } else {
            if (o.index <= target && o.index > event.index) {
              o.index--
            }
          }
        }

        event.index = target
      },
      // Handlers
      createHandler(data, _, event: DS.Event) {
        const id = uniqueId()
        Collections.handlers.send("CREATE", { id })
        event.handlers.push(id)
      },
      moveHandler(data, { handlerId, target }, event: DS.Event) {
        const index = event.handlers.indexOf(handlerId)
        event.handlers.splice(index, 1)
        event.handlers.splice(target, 0, handlerId)
      },
      editHandler(data, { handlerId, changes }) {
        Collections.handlers.send("EDIT", { handlerId, changes })
      },
      duplicateHandler(data, { handlerId }, event: DS.Event) {
        const id = uniqueId()
        Collections.handlers.send("CREATE", { id })
        const dupe = Collections.handlers.data.get(id)
        const source = Collections.handlers.data.get(handlerId)
        if (!dupe || !source) return
        Object.assign(dupe, source)
        dupe.id = id
        dupe.index = Collections.handlers.data.size
        event.handlers.push(id)
      },
      removeHandler(data, { handlerId }, event: DS.Event) {
        const index = event.handlers.indexOf(handlerId)
        Collections.handlers.send("REMOVE", { id: handlerId })
        event.handlers.splice(index, 1)
      },
    },
    conditions: {},
  })

  designer.subscribe((active, data) => {
    const items = JSON.stringify(Array.from(data.entries()), null, 2)
    localStorage.setItem("DS_Events", items)
  })

  return designer
}
