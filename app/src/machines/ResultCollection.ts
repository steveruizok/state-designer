import { StateDesigner } from "state-designer"
import { uniqueId, getLocalSavedData } from "../Utils"
import sortBy from "lodash/sortBy"
import * as DS from "../interfaces/index"
import * as safeEval from "safe-eval"

export function createResultCollection(
  getNewResult: (id: string, custom?: boolean) => DS.Result
) {
  const initial = getNewResult("initial")
  initial.index = 0
  initial.handlers = ["initial"]

  let storedData = getLocalSavedData("DS_Results", [])

  let data: Map<string, DS.Result> = new Map(storedData)

  const designer = new StateDesigner({
    data,
    on: {
      CREATE_CUSTOM: {
        get: "newCustomResult",
        do: "addResult",
      },
      SAVE_CUSTOM: {
        get: "result",
        do: "saveCustom",
      },
      CREATE: {
        get: "newResult",
        do: "addResult",
      },
      REMOVE: {
        do: "removeResult",
      },
      EDIT: {
        get: "result",
        do: ["editResult", "updateError"],
      },
      MOVE: {
        get: "result",
        do: "moveResult",
      },
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
      result: (data, { resultId }) => data.get(resultId),
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
      updateError(_, payload, action) {
        let err: string = ""
        try {
          safeEval(`${action.code}`, { data: {}, payload: {}, result: {} })
        } catch (e) {
          err = e.message
        }

        action.error = err
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
      },
    },
    conditions: {},
  })

  designer.subscribe((active, data) => {
    const items = JSON.stringify(Array.from(data.entries()), null, 2)
    localStorage.setItem("DS_Results", items)
  })

  return designer
}
