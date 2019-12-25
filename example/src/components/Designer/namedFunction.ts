import {
  StateDesigner,
  createStateDesigner,
  createStateDesignerConfig,
  createStateDesignerData
} from "state-designer"

import * as DS from "./types"

export interface NamedFunctionData {
  id: string
  editing: boolean
  dirty: DS.NamedFunction
  clean: DS.NamedFunction
}

export const namedFunctionData = createStateDesignerData<NamedFunctionData>({
  id: "0",
  editing: false,
  dirty: {
    name: "increment",
    code: "data.count++"
  },
  clean: {
    name: "increment",
    code: "data.count++"
  }
})

export const namedFunctionConfig = createStateDesignerConfig({
  data: namedFunctionData,
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

export type NamedFunctionConfig = typeof namedFunctionConfig

export const namedFunctionStateDesigner = createStateDesigner(
  namedFunctionConfig
)

export type NamedFunctionStateDesigner = typeof namedFunctionStateDesigner
