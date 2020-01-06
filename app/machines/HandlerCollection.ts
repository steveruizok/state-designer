import { StateDesigner } from "state-designer"
import uniqueId from "lodash/uniqueId"
import sortBy from "lodash/sortBy"
import { Collections } from "./Collections"
import * as DS from "../interfaces/index"

export function createHandlerCollection(
  getNewItem: (id: string) => DS.EventHandler
) {
  const initial = getNewItem("initial")
  initial.index = 0

  return new StateDesigner({
    data: new Map([[initial.id, initial]]) as Map<string, DS.EventHandler>,
    on: {
      CREATE: {
        get: "newHandler",
        do: "createHandler"
      },
      REMOVE: {
        do: "removeHandler"
      },
      EDIT: {
        get: "handler",
        do: "editHandler"
      },
      MOVE: {
        get: "handler",
        do: "moveHandler"
      },
      CREATE_HANDLER_RESULT: {
        get: "handler",
        do: "createResult"
      },
      MOVE_HANDLER_RESULT: {
        get: "handler",
        do: "moveResult"
      },
      EDIT_HANDLER_RESULT: {
        get: "handler",
        do: "editResult"
      },
      REMOVE_HANDLER_RESULT: {
        get: "handler",
        do: "removeResult"
      },
      CREATE_HANDLER_IF_CONDITION: {
        get: "handler",
        do: "createIfCondition"
      },
      MOVE_HANDLER_IF_CONDITION: {
        get: "handler",
        do: "moveIfCondition"
      },
      EDIT_HANDLER_IF_CONDITION: {
        get: "handler",
        do: "editIfCondition"
      },
      REMOVE_HANDLER_IF_CONDITION: {
        get: "handler",
        do: "removeIfCondition"
      },
      CREATE_HANDLER_ACTION: {
        get: "handler",
        do: "addAction"
      },
      CHANGE_HANDLER_ACTION: [
        {
          get: ["handler", "selectedAction"],
          unless: "actionIsCustom",
          do: "replaceAction"
        },
        {
          get: "handler",
          if: "actionIsCustom",
          do: "replaceCustomAction"
        }
      ],
      MOVE_HANDLER_ACTION: {
        get: "handler",
        do: "moveAction"
      },
      EDIT_HANDLER_ACTION: {
        get: "handler",
        do: "editAction"
      },
      REMOVE_HANDLER_ACTION: {
        get: "handler",
        do: "removeAction"
      }
    },
    results: {
      newHandler: (data, payload = {}) => {
        const { id = uniqueId() } = payload
        const handler = getNewItem(id)
        handler.index = data.size
        return handler
      },
      selectedAction: (data, { actionId }, handler) => {
        return { handler, id: actionId }
      },
      handler: (data, { handlerId }) => data.get(handlerId)
    },
    actions: {
      // Results
      createResult(data, _, handler: DS.EventHandler) {
        const id = uniqueId()
        handler.get.push(id)
        Collections.results.send("CREATE", { id })
      },
      moveResult(data, { resultId, target }, handler: DS.EventHandler) {
        const index = handler.get.indexOf(resultId)
        handler.get.splice(index, 1)
        handler.get.splice(target, 0, resultId)
      },
      editResult(data, { resultId, changes }) {
        Collections.results.send("EDIT", { resultId, changes })
      },
      duplicateResult(data, { resultId }, handler: DS.EventHandler) {
        const id = uniqueId()
        Collections.results.send("CREATE", { id })
        const dupe = Collections.results.data.get(id)
        const source = Collections.results.data.get(resultId)
        if (!dupe || !source) return
        Object.assign(dupe, source)
        dupe.id = id
        dupe.index = Collections.results.data.size
        handler.get.push(id)
      },
      removeResult(data, { resultId }, handler: DS.EventHandler) {
        const index = handler.get.indexOf(resultId)
        Collections.results.send("REMOVE", { id: resultId })
        handler.get.splice(index, 1)
      },
      // Conditions
      createIfCondition(data, _, handler: DS.EventHandler) {
        const id = uniqueId()
        handler.if.push(id)
        Collections.conditions.send("CREATE", { id })
      },
      moveIfCondition(data, { conditionId, target }, handler: DS.EventHandler) {
        const index = handler.if.indexOf(conditionId)
        handler.if.splice(index, 1)
        handler.if.splice(target, 0, conditionId)
      },
      editIfCondition(data, { conditionId, changes }) {
        Collections.conditions.send("EDIT", { conditionId, changes })
      },
      duplicateIfCondition(data, { conditionId }, handler: DS.EventHandler) {
        const id = uniqueId()
        Collections.conditions.send("CREATE", { id })
        const dupe = Collections.conditions.data.get(id)
        const source = Collections.conditions.data.get(conditionId)
        if (!dupe || !source) return
        Object.assign(dupe, source)
        dupe.id = id
        dupe.index = Collections.conditions.data.size
        handler.if.push(id)
      },
      removeIfCondition(data, { conditionId }, handler: DS.EventHandler) {
        const index = handler.if.indexOf(conditionId)
        Collections.conditions.send("REMOVE", { id: conditionId })
        handler.if.splice(index, 1)
      },
      // Actions
      addAction(data, _, handler: DS.EventHandler) {
        const id = uniqueId()
        Collections.actions.send("CREATE_CUSTOM", { id })
        handler.do.push({ id, ref: uniqueId() })
      },
      replaceCustomAction(data, { index }, handler) {
        const id = uniqueId()
        Collections.actions.send("CREATE_CUSTOM", { id })
        handler.do[index] = { id, ref: uniqueId() }
      },
      replaceAction(data, { index }, { handler, id }) {
        handler.do[index] = { id, ref: uniqueId() }
      },
      moveAction(data, { actionRef, target }, handler: DS.EventHandler) {
        const index = handler.do.findIndex(v => v.ref === actionRef)
        const action = handler.do[index]
        if (!action) return
        handler.do.splice(index, 1)
        handler.do.splice(target, 0, action)
      },
      editAction(data, { actionId, changes }) {
        Collections.actions.send("EDIT", { actionId, changes })
      },
      duplicateAction(data, { actionId }, handler: DS.EventHandler) {
        const id = uniqueId()
        Collections.actions.send("CREATE", { id })
        const dupe = Collections.actions.data.get(id)
        const source = Collections.actions.data.get(actionId)
        if (!dupe || !source) return
        Object.assign(dupe, source)
        dupe.id = id
        dupe.index = Collections.actions.data.size
        handler.do.push({ id, ref: uniqueId() })
      },
      removeAction(data, { actionId }, handler: DS.EventHandler) {
        const index = handler.do.indexOf(actionId)
        Collections.actions.send("REMOVE", { id: actionId })
        handler.do.splice(index, 1)
      },
      // Handlers
      createHandler(data, _, handler: DS.EventHandler) {
        data.set(handler.id, handler)
      },
      removeHandler(data, { handlerId }) {
        data.delete(handlerId)
      },
      editHandler(_, { changes }, handler: DS.EventHandler) {
        Object.assign(handler, changes)
      },
      moveHandler(data, { target }, handler: DS.EventHandler) {
        if (target === handler.index) return

        const handlers = sortBy(Array.from(data.values()), "index")

        for (let o of handlers) {
          if (o === handler) continue

          if (target < handler.index) {
            if (o.index >= target && o.index < handler.index) {
              o.index++
            }
          } else {
            if (o.index <= target && o.index > handler.index) {
              o.index--
            }
          }
        }

        handler.index = target
      }
    },
    conditions: {
      actionIsCustom: (data, { actionId, index }, handler) => {
        return actionId === "custom"
      }
    }
  })
}
