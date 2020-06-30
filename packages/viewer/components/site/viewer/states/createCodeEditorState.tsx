// @refresh reset
import { createState } from "@state-designer/react"

export type CodeEditorOptions = {
  defaultValue: string
  onSave: (value: string) => void
  validate?: (value: string) => string
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
    on: {
      CHANGED_CODE: { do: ["setDirty", "setError"], to: "editing" },
    },
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
          REFRESHED: {
            unless: "incomingCodeMatchesClean",
            do: ["setClean", "setDirty"],
          },
        },
      },
      editing: {
        on: {
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
            to: "dirtied.valid",
            else: { to: "dirtied.invalid" },
          },
        },
        states: {
          pristine: {},
          dirtied: {
            on: {
              CANCELLED: { do: "resetDirtyToClean", to: "pristine" },
            },
            states: {
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
              invalid: {},
            },
          },
          same: {},
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
        data.error = options.validate(data.dirty)
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
