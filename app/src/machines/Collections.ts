import { uniqueId } from "../Utils"
import * as DS from "../interfaces/index"

import { createCollection } from "./Collection"
import { createResultCollection } from "./ResultCollection"
import { createConditionCollection } from "./ConditionCollection"
import { createActionCollection } from "./ActionCollection"
import { createHandlerCollection } from "./HandlerCollection"
import { createEventCollection } from "./EventCollection"
import { createStateCollection } from "./StateCollection"

export const Collections = {
  states: createStateCollection((id: string = uniqueId()) => ({
    index: 0,
    id,
    name: "newState" + uniqueId(),
    events: [],
    states: [],
  })),
  events: createEventCollection((id: string = uniqueId()) => ({
    index: 0,
    id,
    name: "NEW_EVENT",
    payload: "",
    handlers: [],
  })),
  handlers: createHandlerCollection((id: string = uniqueId()) => ({
    index: 0,
    id,
    do: [],
    if: [],
    unless: [],
    ifAny: [],
    get: [],
    await: [],
  })),
  transitions: createCollection<DS.Transition>((id: string = uniqueId()) => ({
    index: 0,
    id,
    custom: false,
    type: DS.NamedFunctions.Transition,
    name: "newTransition",
    code: "",
    mustReturn: true,
    returnType: "string",
    handlers: [],
  })),
  actions: createActionCollection((id: string = uniqueId(), custom = true) => ({
    index: 0,
    id,
    custom,
    type: DS.NamedFunctions.Action,
    name: custom ? "Custom" : "initial",
    code: "data.count++",
    mustReturn: false,
    handlers: [],
  })),
  conditions: createConditionCollection(
    (id: string = uniqueId(), custom = true) => ({
      index: 0,
      id,
      custom,
      type: DS.NamedFunctions.Condition,
      name: custom ? "Custom" : "newCondition",
      code: "",
      mustReturn: true,
      returnType: "boolean",
      handlers: [],
    })
  ),
  results: createResultCollection((id: string = uniqueId(), custom = true) => ({
    index: 0,
    id,
    custom,
    type: DS.NamedFunctions.Result,
    name: custom ? "Custom" : "newResult",
    code: "",
    mustReturn: true,
    handlers: [],
  })),
  asyncs: createCollection<DS.AsyncEventHandlerCallback>(
    (id: string = uniqueId()) => ({
      index: 0,
      id,
      name: "newAsync",
      type: DS.NamedFunctions.Async,
      get: async function() {},
      then: [],
      catch: [],
    })
  ),
}
