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
  hasChanges: boolean
  editing: boolean
  dirty: DS.NamedFunction
  clean: DS.NamedFunction
  error?: string
}

export const namedFunctionData = createStateDesignerData<NamedFunctionData>({
  id: uniqueId(),
  editing: false,
  hasChanges: false,
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
  getNamedFunctionConfig(data)

export const getNamedFunctionConfig = (data: any) => {
  return createStateDesignerConfig({
    data: data,
    on: {
      UPDATE_NAME: [
        {
          unless: "hasChanges",
          do: "updateChanges"
        },
        {
          do: ["updateName", "updateError"]
        }
      ],
      UPDATE_CODE: [
        {
          unless: "hasChanges",
          do: "updateChanges"
        },
        {
          do: ["updateCode", "updateError"]
        }
      ],
      BLUR: {
        unless: "hasChanges",
        do: "stopEditing"
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
      updateChanges: data => (data.hasChanges = true),
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
          data.error = e.message
          return
        }

        if (
          data.clean.mustReturn &&
          data.dirty.code !== undefined &&
          !data.dirty.code.includes("return")
        ) {
          data.error = "Must return a value."
          return
        }

        if (data.dirty.name.length === 0) {
          data.error = "Must have a name"
          return
        }

        try {
          new Function(`const ${data.dirty.name} = "str"`)
        } catch (e) {
          data.error = "Invalid name"
          return false
        }

        return (data.error = undefined)
      }
    },
    conditions: {
      hasChanges: data => data.hasChanges,
      nameIsValid: data => {
        if (data.dirty.name.length > 0) return false

        try {
          Function(`const ${data.name} = "str"`)
        } catch (e) {
          return false
        }

        return true
      },
      codeIsValid: data => data.error === undefined
    }
  })
}

export type NamedFunctionConfig = ReturnType<typeof createNamedFunctionConfig>
