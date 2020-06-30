// @refresh reset
import { createState } from "@state-designer/core"
import { createSimpleEditorState } from "./createSimpleEditorState"
import { createCodeEditorState } from "./createCodeEditorState"
import {
  updateProject,
  subscribeToDocSnapshot,
} from "../../../../utils/firebase"

/* -------------------------------------------------- */
/*                    Main Project                    */
/* -------------------------------------------------- */

export const project = createState({
  data: {
    name: "",
    oid: "",
    uid: "",
    pid: "",
    error: "",
    isOwner: false,
    captive: createState({}),
    code: {
      state: "",
      jsx: "",
      theme: "",
      statics: "",
    },
  },
  initial: "loading",
  states: {
    idle: {},
    loading: {
      on: {
        SNAPSHOT_UPDATED: { do: "updateStates", to: "ready" },
      },
    },
    ready: {
      onEvent: "updateStates",
      on: {
        SNAPSHOT_UPDATED: {},
        CHANGED_NAME: "setName",
        CHANGED_CODE: [
          { if: "changeUpdatesState", do: "setCaptiveState" },
          "setCode",
        ],
      },
    },
  },
  on: {
    OPENED_PROJECT: {
      do: ["setupProject", "subscribeToProjectChanges"],
      to: "loading",
    },
  },
  conditions: {
    changeUpdatesState(data, { globalId }) {
      return globalId === "state"
    },
  },
  actions: {
    setupProject(d, { data }) {
      d.error = ""
      d.pid = data.pid
      d.oid = data.oid
      d.uid = data.uid
      d.isOwner = data.uid === data.oid
    },
    subscribeToProjectChanges(data) {
      const { pid, oid } = data

      subscribeToDocSnapshot(pid, oid, (doc) => {
        const source = doc.data()
        project.send("SNAPSHOT_UPDATED", { source })
      })
    },
    setCode(data, { globalId, code }) {
      data[globalId] = code
    },
    setName(data, { name }) {
      data.name = name
    },
    updateFirebase(data) {
      const { pid, oid, code } = data
      updateProject(pid, oid, code)
    },
    setCaptiveState(data) {
      const { state } = data.code

      let code = JSON.parse(state).slice(12, -2) // trim createState call

      try {
        const design = Function("return " + code)()
        data.captive = createState(design)
        data.error = ""
      } catch (err) {
        console.warn("Error building captive state", err)
        data.error = err.message
      }
    },
    updateStates(data) {
      const { jsx, state, theme, statics } = data.code
      jsxEditor.send("REFRESHED", { code: jsx })
      stateEditor.send("REFRESHED", { code: state })
      themeEditor.send("REFRESHED", { code: theme })
      staticsEditor.send("REFRESHED", { code: statics })
      nameEditor.send("REFRESHED", { value: data.name })
    },
  },
})

/* -------------------------------------------------- */
/*                       Editors                      */
/* -------------------------------------------------- */

export const stateEditor = createCodeEditorState({
  defaultValue: "",
  onSave: (code) => project.send("CHANGED_CODE", { globalId: "state", code }),
  validate: (code) => {
    let err = ""

    try {
      Function("fn", `fn(${code.slice(12, -2)})`)(createState)
    } catch (e) {
      err = e.message
    }

    return err
  },
})

export const jsxEditor = createCodeEditorState({
  defaultValue: "",
  onSave: (code) => project.send("CHANGED_CODE", { globalId: "jsx", code }),
  validate: () => "",
})

export const themeEditor = createCodeEditorState({
  defaultValue: "",
  onSave: (code) => project.send("CHANGED_CODE", { globalId: "theme", code }),
  validate: (code) => {
    let err = ""

    try {
      Function(code)
    } catch (e) {
      err = e.message
    }

    return err
  },
})

export const staticsEditor = createCodeEditorState({
  defaultValue: "",
  onSave: (code) => project.send("CHANGED_CODE", { globalId: "statics", code }),
  validate: (code) => {
    let err = ""

    try {
      Function(code)
    } catch (e) {
      err = e.message
    }

    return err
  },
})

export const nameEditor = createSimpleEditorState({
  defaultValue: "",
  onSave: (name) => project.send("CHANGED_NAME", { name }),
})

/* -------------------------------------------------- */
/*                     Highlights                     */
/* -------------------------------------------------- */

type HighlightData = {
  event: string | null
  state: string | null
  scrollToLine: boolean
}

const initialData: HighlightData = {
  event: null,
  state: null,
  scrollToLine: false,
}

export const Highlights = createState({
  data: initialData,
  initial: "highlit",
  states: {
    idle: {
      on: {
        HIGHLIT_EVENT: { do: "setEventHighlight", to: "highlit" },
        HIGHLIT_STATE: { do: "setStateHighlight", to: "highlit" },
      },
    },
    highlit: {
      on: {
        CLEARED_HIGHLIGHT: { do: "clearHighlights", to: "idle" },
        HIGHLIT_EVENT: { do: ["clearHighlights", "setEventHighlight"] },
        HIGHLIT_STATE: { do: ["clearHighlights", "setStateHighlight"] },
      },
    },
  },
  actions: {
    setEventHighlight(data, { eventName, shiftKey }) {
      data.event = eventName
      data.scrollToLine = shiftKey
    },
    setStateHighlight(data, { stateName, shiftKey }) {
      data.state = stateName
      data.scrollToLine = shiftKey
    },
    clearHighlights(data) {
      data.state = null
      data.event = null
      data.scrollToLine = false
    },
  },
})
