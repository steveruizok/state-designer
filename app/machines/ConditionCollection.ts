import { StateDesigner } from "state-designer"
import uniqueId from "lodash/uniqueId"
import sortBy from "lodash/sortBy"
import * as DS from "../interfaces/index"
import { Collections } from "./Collections"

export function createConditionCollection(
  getNewCondition: (id: string) => DS.Condition
) {
  const initial = getNewCondition("initial")
  initial.index = 0
  initial.handlers = ["initial"]

  return new StateDesigner({
    data: new Map([[initial.id, initial]]) as Map<string, DS.Condition>,
    on: {
      CREATE: {
        get: "newCondition",
        do: "addCondition"
      },
      REMOVE: {
        do: "removeCondition"
      },
      EDIT: {
        get: "condition",
        do: "editCondition"
      },
      MOVE: {
        get: "condition",
        do: "moveCondition"
      }
    },
    results: {
      newCondition: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const condition = getNewCondition(id)
        condition.index = data.size

        return condition
      },
      condition: (data, { conditionId }) => data.get(conditionId)
    },
    actions: {
      addCondition(data, _, condition: DS.Condition) {
        data.set(condition.id, condition)
      },
      removeCondition(data, { conditionId }) {
        data.delete(conditionId)
      },
      editCondition(_, { changes }, condition: DS.Condition) {
        Object.assign(condition, changes)
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
}
