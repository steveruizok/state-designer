import { StateDesigner } from "state-designer"
import uniqueId from "lodash/uniqueId"
import sortBy from "lodash/sortBy"
import * as DS from "../interfaces/index"

export function createResultCollection(
  getNewResult: (id: string, custom?: boolean) => DS.Result
) {
  const initial = getNewResult("initial")
  initial.index = 0
  initial.handlers = ["initial"]

  return new StateDesigner({
    data: new Map([[initial.id, initial]]) as Map<string, DS.Result>,
    on: {
      CREATE_CUSTOM: {
        get: "newCustomResult",
        do: "addResult"
      },
      SAVE_CUSTOM: {
        get: "result",
        do: "saveCustom"
      },
      CREATE: {
        get: "newResult",
        do: "addResult"
      },
      REMOVE: {
        do: "removeResult"
      },
      EDIT: {
        get: "result",
        do: "editResult"
      },
      MOVE: {
        get: "result",
        do: "moveResult"
      }
    },
    results: {
      newCustomResult: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const result = getNewResult(id, true)
        result.index = data.size

        return result
      },
      newResult: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const result = getNewResult(id)
        result.index = data.size

        return result
      },
      result: (data, { resultId }) => data.get(resultId)
    },
    actions: {
      saveCustom(_, payload, result: DS.Result) {
        result.custom = false
      },
      addResult(data, _, result: DS.Result) {
        data.set(result.id, result)
      },
      removeResult(data, { resultId }) {
        data.delete(resultId)
      },
      editResult(_, { changes }, result: DS.Result) {
        Object.assign(result, changes)
      },
      moveResult(data, { target }, result: DS.Result) {
        if (target === result.index) return

        const results = sortBy(Array.from(data.values()), "index")

        for (let o of results) {
          if (o === result) continue

          if (target < result.index) {
            if (o.index >= target && o.index < result.index) {
              o.index++
            }
          } else {
            if (o.index <= target && o.index > result.index) {
              o.index--
            }
          }
        }

        result.index = target
      }
    },
    conditions: {}
  })
}
