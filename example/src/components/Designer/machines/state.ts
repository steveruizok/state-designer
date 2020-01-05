import { uniqueId } from "lodash"
import * as DS from "../types"
import { StateDesigner, createStateDesignerConfig } from "state-designer"
import { emptyEventConfig, defaultEventConfig, EventConfig } from "./event"

export type StateConfigData = {
  id: string
  name: string
  on: StateDesigner<EventConfig>[]
}

export const stateConfig = createStateDesignerConfig({
  data: {
    id: uniqueId(),
    name: "newState",
    on: [] as any[]
  },
  initial: "closed",
  states: {
    closed: {
      on: {
        EDIT: { to: "editing" }
      }
    },
    editing: {
      on: {
        CREATE_EVENT: {
          get: "newEvent",
          do: "addEvent"
        },
        CHANGE_NAME: {
          do: "updateName"
        },
        MOVE_EVENT: {
          get: "eventIndex",
          if: "canMoveEvent",
          do: "moveEvent"
        }
      },
      initial: "clean",
      states: {
        clean: {
          on: {
            CHANGE_NAME: {
              to: "dirty"
            }
          }
        },
        dirty: {
          on: {}
        }
      }
    }
  },
  results: {
    event: (data, { id }) => data.on.find(item => item.id === id),
    eventIndex: (data, { id }) => data.on.findIndex(item => item.id === id),
    newEvent: () => {
      return new StateDesigner(emptyEventConfig)
    }
  },
  actions: {
    updateName: (data, { name }) => {
      data.name = name
    },
    addEvent: (data, payload, newEvent) => {
      data.on.push(newEvent)
    },
    moveEvent: (data, { delta }, index) => {
      const t = data.on[index]
      data.on[index] = data.on[index + delta]
      data.on[index + delta] = t
    },
    removeEvent: (data, payload, event) => {
      const index = data.on.indexOf(event)
      data.on.splice(index, 1)
    }
  },
  conditions: {
    nameIsValid: (data, { name }) => {
      return !name.includes(" ")
    },
    canMoveEvent: (data, { delta }, index) =>
      !(delta + index < 0 || delta + index > data.on.length - 1)
  }
})

export type StateConfig = typeof stateConfig
