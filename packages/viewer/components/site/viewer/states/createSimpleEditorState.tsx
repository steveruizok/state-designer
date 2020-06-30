// @refresh reset
import { createState } from "@state-designer/react"

export type SimpleEditorOptions = {
  defaultValue: string
  onSave: (value: string) => void
  transform?: (value: string) => string
  validate?: (value: string) => boolean
}

export function createSimpleEditorState(
  options: SimpleEditorOptions = {} as SimpleEditorOptions
) {
  return createState({
    data: {
      clean: options.defaultValue,
      dirty: options.defaultValue,
      error: "",
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          STARTED_EDITING: { to: "editing" },
          REFRESHED: {
            unless: "incomingMatchesClean",
            do: ["setClean", "setDirty"],
          },
        },
      },
      editing: {
        initial: {
          if: "valueMatchesClean",
          to: "match",
          else: {
            if: "errorIsClear",
            to: "valid",
            else: { to: "invalid" },
          },
        },
        states: {
          match: {
            on: { STOPPED_EDITING: { to: "idle" } },
          },
          valid: {
            on: {
              CANCELLED_CHANGES: {
                do: ["resetValue", "clearError"],
                to: "match",
              },
              QUICK_SAVED_CHANGES: [
                "saveDirtyToClean",
                "saveChanges",
                { to: "match" },
              ],
              SAVED_CHANGES: [
                "saveDirtyToClean",
                "saveChanges",
                { to: "idle" },
              ],
            },
          },
          invalid: {
            on: {
              CANCELLED_CHANGES: {
                do: ["resetValue", "clearError"],
                to: "idle",
              },
            },
          },
        },
        on: {
          CHANGED_CODE: ["setDirty", "setError", { to: "editing" }],
          REFRESHED: {
            unless: "incomingMatchesClean",
            do: "setClean",
          },
        },
      },
    },
    on: {},
    conditions: {
      incomingMatchesClean(data, { value }) {
        return data.clean === value
      },
      valueMatchesClean(data) {
        return data.dirty === data.clean
      },
      errorIsClear(data) {
        return data.error === ""
      },
    },
    results: {
      transformedValue(_, payload) {
        const { transform } = options
        return transform ? transform(payload) : payload
      },
    },
    actions: {
      setClean(data, { value }) {
        data.clean = value
      },
      setDirty(data, { value }) {
        data.dirty = value
      },
      resetValue(data) {
        data.dirty = data.clean
      },
      saveDirtyToClean(data) {
        data.clean = data.dirty
      },
      clearError(data) {
        data.error = ""
      },
      setError(data) {
        const { validate } = options
        return validate ? validate(data.dirty) : ""
      },
      saveChanges(data) {
        options.onSave(data.clean)
      },
    },
  })
}
