import { StateDesigner } from "state-designer"
import uniqueId from "lodash/uniqueId"
import sortBy from "lodash/sortBy"
import * as DS from "../interfaces/index"
import { Collections } from "./Collections"

export function createActionCollection(
  getNewAction: (id: string, custom?: boolean) => DS.Action
) {
  const initial = getNewAction("initial")
  initial.index = 0
  initial.handlers = ["initial"]

  return new StateDesigner({
    data: new Map([[initial.id, initial]]) as Map<string, DS.Action>,
    on: {
      CREATE_CUSTOM: {
        get: "newCustomAction",
        do: "addAction"
      },
      CREATE: {
        get: "newAction",
        do: "addAction"
      },
      REMOVE: {
        do: "removeAction"
      },
      EDIT: {
        get: "action",
        do: "editAction"
      },
      SAVE_CUSTOM: {
        get: "action",
        do: "saveCustom"
      },
      MOVE: {
        get: "action",
        do: "moveAction"
      }
    },
    results: {
      newCustomAction: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const action = getNewAction(id, true)
        action.index = data.size

        return action
      },
      newAction: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const action = getNewAction(id)
        action.index = data.size

        return action
      },
      action: (data, { actionId }) => data.get(actionId)
    },
    actions: {
      addAction(data, _, action: DS.Action) {
        data.set(action.id, action)
      },
      removeAction(data, { actionId }) {
        data.delete(actionId)
      },
      saveCustom(_, payload, action: DS.Action) {
        action.custom = false
      },
      editAction(_, { changes }, action: DS.Action) {
        Object.assign(action, changes)
      },
      moveAction(data, { target }, action: DS.Action) {
        if (target === action.index) return

        const actions = sortBy(Array.from(data.values()), "index")

        for (let o of actions) {
          if (o === action) continue

          if (target < action.index) {
            if (o.index >= target && o.index < action.index) {
              o.index++
            }
          } else {
            if (o.index <= target && o.index > action.index) {
              o.index--
            }
          }
        }

        action.index = target
      }
    },
    conditions: {}
  })
}
