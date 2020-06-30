// @refresh reset
import { createState } from "@state-designer/react"

export type CodeEditorOptions = {
  defaultValue: string
  onSave: (value: string) => void
  validate?: (value: string) => any
}

export function createCodeEditorState(
  options: CodeEditorOptions = {} as CodeEditorOptions
) {
  return createState({
    data: {
      globalId: "",
      clean: "",
      dirty: "",
      error: "",
    },
    on: {},
    initial: "loading",
    states: {
      loading: {
        on: {
          REFRESHED: {
            do: ["setClean", "setDirty"],
            to: "idle",
          },
        },
      },
      idle: {
        on: {
          CHANGED_CODE: { do: ["setDirty", "setError"], to: "editing" },
          REFRESHED: {
            unless: "incomingCodeMatchesClean",
            do: ["setClean", "setDirty"],
          },
        },
      },
      editing: {
        on: {
          CANCELLED: { do: "resetDirtyToClean", to: "pristine" },
          CHANGED_CODE: { do: ["setDirty", "setError"], to: "editing" },
          REFRESHED: {
            unless: "incomingCodeMatchesClean",
            do: ["setClean"],
          },
        },
        initial: {
          if: "codeMatchesClean",
          to: "pristine",
          else: {
            if: "errorIsClear",
            to: "valid",
            else: { to: "invalid" },
          },
        },
        states: {
          pristine: {},
          invalid: {},
          valid: {
            on: {
              QUICK_SAVED: {
                do: ["saveDirtyToClean", "saveCode"],
                to: "pristine",
              },
              SAVED: {
                do: ["saveDirtyToClean", "saveCode"],
                to: ["pristine", "idle"],
              },
            },
          },
        },
      },
    },
    conditions: {
      incomingCodeMatchesClean(data, { code }) {
        return data.clean === code
      },
      codeMatchesClean(data) {
        return data.dirty === data.clean
      },
      errorIsClear(data) {
        return data.error === ""
      },
    },
    actions: {
      loadProject(d, { code }) {
        d.clean = code
        d.dirty = code
      },
      setClean(data, { code }) {
        data.clean = code
      },
      setDirty(data, { code }) {
        data.dirty = code
      },
      setError(data) {
        let err = ""

        try {
          options.validate(data.dirty)
        } catch (e) {
          err = e.message
        }

        data.error = err
      },
      saveDirtyToClean(data) {
        data.clean = data.dirty
      },
      clearError(data) {
        data.error = ""
      },
      resetDirtyToClean(data) {
        data.dirty = data.clean
      },
      saveCode(data) {
        options.onSave(data.clean)
      },
    },
  })
}
