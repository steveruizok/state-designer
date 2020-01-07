import { StateDesigner } from "state-designer"
import { uniqueId, getLocalSavedData } from "../Utils"
import sortBy from "lodash/sortBy"
import * as DS from "../interfaces/index"
import * as safeEval from "safe-eval"

export function createConditionCollection(
  getNewCondition: (id: string, custom?: boolean) => DS.Condition
) {
  const initial = getNewCondition("initial")
  initial.index = 0
  initial.handlers = ["initial"]

  let storedData = getLocalSavedData("DS_Conditions", [])

  let data: Map<string, DS.Condition> = new Map(storedData)

  const designer = new StateDesigner({
    data,
    on: {
      CREATE_CUSTOM: {
        get: "newCustomCondition",
        do: "addCondition"
      },
      SAVE_CUSTOM: {
        get: "condition",
        do: "saveCustom"
      },
      CREATE: {
        get: "newCondition",
        do: "addCondition"
      },
      REMOVE: {
        do: "removeCondition"
      },
      EDIT: {
        get: "condition",
        do: ["editCondition", "updateError"]
      },
      MOVE: {
        get: "condition",
        do: "moveCondition"
      }
    },
    results: {
      newCustomCondition: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const condition = getNewCondition(id, true)
        condition.index = data.size

        return condition
      },
      newCondition: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const condition = getNewCondition(id)
        condition.index = data.size

        return condition
      },
      condition: (data, { conditionId }) => data.get(conditionId)
    },
    actions: {
      saveCustom(_, payload, condition: DS.Condition) {
        condition.custom = false
      },
      addCondition(data, _, condition: DS.Condition) {
        data.set(condition.id, condition)
      },
      removeCondition(data, { conditionId }) {
        data.delete(conditionId)
      },
      editCondition(_, { changes }, condition: DS.Condition) {
        Object.assign(condition, changes)
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
      moveCondition(data, { target }, condition: DS.Condition) {
        if (target === condition.index) return

        const conditions = sortBy(Array.from(data.values()), "index")

        for (let o of conditions) {
          if (o === condition) continue

          if (target < condition.index) {
            if (o.index >= target && o.index < condition.index) {
              o.index++
            }
          } else {
            if (o.index <= target && o.index > condition.index) {
              o.index--
            }
          }
        }

        condition.index = target
      }
    },
    conditions: {}
  })

  designer.subscribe((active, data) => {
    const items = JSON.stringify(Array.from(data.entries()), null, 2)
    localStorage.setItem("DS_Conditions", items)
  })

  return designer
}
