import { uniqueId } from "lodash-es"
import { StateDesigner, createStateDesignerConfig } from "state-designer"
import { emptyEventConfig, defaultEventConfig, EventConfig } from "./event"

export interface EventsListData {
  items: {
    id: string
    item: StateDesigner<EventConfig>
  }[]
}

export const createEventsListConfig = (data: EventsListData) =>
  createStateDesignerConfig({
    data,
    on: {
      CREATE_EVENT: {
        get: "newEvent",
        do: "addEvent"
      },
      REMOVE_EVENT: {
        get: "event",
        do: "removeEvent"
      },
      MOVE_EVENT: {
        get: "eventIndex",
        if: "canMoveEvent",
        do: "moveEvent"
      }
    },
    results: {
      event: (data, { id }) => data.items.find(item => item.id === id),
      eventIndex: (data, { id }) =>
        data.items.findIndex(item => item.id === id),
      newEvent: () => {
        return {
          id: uniqueId(),
          item: new StateDesigner(emptyEventConfig)
        }
      }
    },
    actions: {
      addEvent: (data, payload, newItem) => data.items.push(newItem),
      moveEvent: (data, { delta }, index) => {
        const t = data.items[index]
        data.items[index] = data.items[index + delta]
        data.items[index + delta] = t
      },
      removeEvent: (data, payload, event) => {
        const index = data.items.indexOf(event)
        data.items.splice(index, 1)
      }
    },
    conditions: {
      canMoveEvent: (data, { delta }, index) =>
        !(delta + index < 0 || delta + index > data.items.length - 1)
    }
  })

export const eventsListConfig = createEventsListConfig({
  items: [
    {
      id: uniqueId(),
      item: new StateDesigner(defaultEventConfig)
    }
  ]
})

export type EventsListConfig = typeof eventsListConfig
