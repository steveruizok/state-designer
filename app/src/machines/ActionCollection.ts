import { StateDesigner } from "state-designer"
import { uniqueId, getLocalSavedData } from "../Utils"
import sortBy from "lodash/sortBy"
import * as safeEval from "safe-eval"

import * as DS from "../interfaces/index"

export function createActionCollection(
  getNewAction: (id: string, custom?: boolean) => DS.Action
) {
  const initial = getNewAction("initial")
  initial.index = 0
  initial.handlers = ["initial"]

  let storedData = getLocalSavedData("DS_Actions", [])

  let data: Map<string, DS.Action> = new Map(storedData)

  const designer = new StateDesigner({
    data,
    on: {
      CREATE_CUSTOM: {
        get: "newCustomAction",
        do: "addAction"
      },
      SAVE_CUSTOM: {
        get: "action",
        do: "saveCustom"
      },
      CREATE: {
        get: "newAction",
        do: "addAction"
      },
      REMOVE: {
        do: "removeAction"
      },
      EDIT: [
        {
          get: "action",
          do: ["editAction", "updateError"]
        }
      ],
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
      updateError(_, payload, action) {
        let err: string = ""
        try {
          safeEval(`${action.code}`, { data: {}, payload: {}, result: {} })
        } catch (e) {
          err = e.message
        }

        action.error = err
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

  designer.subscribe((active, data) => {
    const items = JSON.stringify(Array.from(data.entries()), null, 2)
    localStorage.setItem("DS_Actions", items)
  })

  return designer
}
