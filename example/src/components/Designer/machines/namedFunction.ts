import { uniqueId } from "lodash-es"
import {
  StateDesigner,
  createStateDesigner,
  createStateDesignerConfig,
  createStateDesignerData
} from "state-designer"

import * as DS from "../types"

export interface NamedFunctionData {
  id: string
  editing: boolean
  dirty: DS.NamedFunction
  clean: DS.NamedFunction
  error?: string
}

export const namedFunctionData = createStateDesignerData<NamedFunctionData>({
  id: uniqueId(),
  editing: false,
  error: undefined,
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

export const createNamedFunctionConfig = (data: NamedFunctionData) =>
  createStateDesignerConfig({
    data,
    on: {
      UPDATE_NAME: {
        do: "updateName"
      },
      UPDATE_CODE: {
        do: ["updateCode", "updateError"]
      },
      EDIT: {
        do: "startEditing"
      },
      SAVE: {
        if: "codeIsValid",
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
      },
      updateError: data => {
        try {
          new Function("data", "payload", "result", data.dirty.code)
        } catch (e) {
          return (data.error = e.message)
        }

        if (
          data.clean.mustReturn &&
          data.dirty.code !== undefined &&
          !data.dirty.code.includes("return")
        ) {
          data.error = "Must return a value."
        }

        return (data.error = undefined)
      }
    },
    conditions: {
      nameIsValid: data => data.dirty.name.length > 0,
      codeIsValid: data => data.error === undefined
    }
  })

export const namedActionData = createStateDesignerData<NamedFunctionData>({
  id: uniqueId(),
  editing: false,
  error: undefined,
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

export const nameConditionData = createStateDesignerData<NamedFunctionData>({
  id: uniqueId(),
  editing: false,
  error: undefined,
  dirty: {
    name: "DECREMENT",
    code: "return data.count--",
    mustReturn: true
  },
  clean: {
    name: "DECREMENT",
    code: "return data.count--",
    mustReturn: true
  }
})

export const getNamedFunctionConfig = (data: any) => {
  return createStateDesignerConfig({
    data: data,
    on: {
      UPDATE_NAME: {
        do: "updateName"
      },
      UPDATE_CODE: {
        do: ["updateCode", "updateError"]
      },
      EDIT: {
        do: "startEditing"
      },
      SAVE: {
        if: "codeIsValid",
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
      },
      updateError: data => {
        try {
          new Function("data", "payload", "result", data.dirty.code)
        } catch (e) {
          return (data.error = e.message)
        }

        if (
          data.clean.mustReturn &&
          data.dirty.code !== undefined &&
          !data.dirty.code.includes("return")
        ) {
          data.error = "Must return a value."
        }

        return (data.error = undefined)
      }
    },
    conditions: {
      nameIsValid: data => data.dirty.name.length > 0,
      codeIsValid: data => data.error === undefined
    }
  })
}

export type NamedFunctionConfig = ReturnType<typeof createNamedFunctionConfig>
