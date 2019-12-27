import {
  StateDesigner,
  createStateDesigner,
  createStateDesignerConfig,
  createStateDesignerData
} from "state-designer"

import { uniqueId } from "lodash-es"

import * as DS from "../types"

export interface HandlerData {
  id: string
  editing: boolean
  dirty: DS.NamedFunction
  clean: DS.NamedFunction
}

export const handlerData = createStateDesignerData<HandlerData>({
  id: uniqueId(),
  editing: false,
  dirty: {
    name: "INCREMENT",
    code: "data.count++",
    mustReturn: false
  },
  clean: {
    name: "INCREMENT",
    code: "data.count++",
    mustReturn: false
  }
})

export const handlerConfig = createStateDesignerConfig({
  data: handlerData,
  on: {
    UPDATE_NAME: {
      do: "updateName"
    },
    UPDATE_CODE: {
      do: "updateCode"
    },
    EDIT: {
      do: "startEditing"
    },
    SAVE: {
      do: ["saveEdits", "stopEditing"]
    },
    CANCEL: {
      do: ["cancelEdits", "stopEditing"]
    }
  },
  actions: {
    updateName: (data, name) => {
      data.dirty.name = name
    },
    updateCode: (data, code) => {
      data.dirty.code = code
    },
    cancelEdits: data => {
      Object.assign(data.dirty, data.clean)
    },
    saveEdits: data => {
      Object.assign(data.clean, data.dirty)
    },
    stopEditing: data => {
      data.editing = false
    },
    startEditing: data => {
      data.editing = true
    }
  },
  conditions: {
    nameIsValid: data => true,
    codeIsValid: data => true
  }
})

export type HandlerConfig = typeof handlerConfig
