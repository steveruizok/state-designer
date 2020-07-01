// @refresh reset
import { createState } from "@state-designer/react"
import { createSimpleEditorState } from "./createSimpleEditorState"
import { createCodeEditorState } from "./createCodeEditorState"
import { defaultTheme, defaultStatics } from "../../static/defaults"
import {
  updateProject,
  subscribeToDocSnapshot,
  ProjectResponse,
  forkProject,
} from "../../../utils/firebase"
import router from "next/router"
import * as Utils from "../../static/scope-utils"

/* -------------------------------------------------- */
/*                    Main Project                    */
/* -------------------------------------------------- */

export const Project = createState({
  data: {
    name: "",
    oid: "",
    uid: "",
    pid: "",
    error: "",
    isProject: false,
    isAuthenticated: false,
    isOwner: false,
    theme: {} as { [key: string]: any },
    captive: createState({}),
    statics: {},
    code: {
      state: "",
      jsx: "",
      theme: defaultTheme,
      statics: "",
    },
  },
  states: {
    auth: {
      initial: "loading",
      states: {
        loading: {},
        authenticated: {
          on: {
            SIGNED_OUT: { to: "notAuthenticated" },
          },
        },
        notAuthenticated: {
          on: {
            STARTED_AUTHENTICATING: { to: "authenticating" },
          },
        },
        authenticating: {
          on: {
            SIGNED_IN: { to: "authenticated" },
            AUTH_FAILED: { to: "notAuthenticated" },
          },
        },
      },
    },
    app: {
      initial: "noProject",
      states: {
        noProject: {},
        notFound: {},
        loading: {
          on: {
            SNAPSHOT_UPDATED: [
              "updateFromFirebase",
              "setStaticValues",
              "setCaptiveState",
              "setCaptiveTheme",
              "updateStates",
              { to: "ready" },
            ],
          },
        },
        ready: {
          on: {
            FORKED_PROJECT: [
              {
                if: "isAuthenticated",
                then: {
                  if: "isOwner",
                  do: "copyProject",
                  else: { do: "forkProject" },
                },
                else: "authenticate",
              },
            ],
            SNAPSHOT_UPDATED: [
              "updateFromFirebase",
              {
                if: "changeUpdatesCaptiveState",
                do: ["setStaticValues", "setCaptiveState", "setCaptiveTheme"],
              },
              "updateStates",
            ],
            CHANGED_CODE: [
              "setCode",
              "setStaticValues",
              "updateStates",
              "updateFirebase",
            ],
            CHANGED_NAME: "setName",
          },
          states: {
            tabs: {
              initial: "state",
              on: {
                TABBED_TO_STATE: { to: "state" },
                TABBED_TO_JSX: { to: "jsx" },
                TABBED_TO_STATIC: { to: "static" },
                TABBED_TO_THEME: { to: "theme" },
              },
              states: {
                state: {
                  on: { CHANGED_CODE: ["setStaticValues", "setCaptiveState"] },
                },
                jsx: {},
                static: {
                  on: {
                    CHANGED_CODE: [
                      "setStaticValues",
                      "setCaptiveTheme",
                      "setCaptiveState",
                    ],
                  },
                },
                theme: {
                  on: { CHANGED_CODE: ["setCaptiveTheme"] },
                },
              },
            },
          },
        },
      },
      on: {
        CLOSED_PROJECT: { do: "clearProject", to: "noProject" },
      },
    },
  },
  on: {
    OPENED_PROJECT: [
      {
        do: ["setupProject", "subscribeToProjectChanges"],
      },
      {
        if: "isProject",
        then: {
          if: "isAuthenticated",
          to: ["loading", "authenticated"],
          else: { to: ["loading", "notAuthenticated"] },
        },
        else: {
          if: "isAuthenticated",
          to: ["notFound", "authenticated"],
          else: { to: ["notFound", "notAuthenticated"] },
        },
      },
    ],
  },
  conditions: {
    isAuthenticated(data) {
      return data.isAuthenticated
    },
    isProject(data) {
      return data.isProject
    },
    isOwner(data) {
      return data.isOwner
    },
    changeUpdatesCaptiveState(data, { source }) {
      return false // maybe this will happen when editor state changes
    },
  },
  actions: {
    clearProject(data) {
      data.error = ""
      data.pid = ""
      data.isOwner = false
    },
    setupProject(d, { data }: { data: ProjectResponse }) {
      d.error = ""
      d.pid = data.pid
      d.oid = data.oid
      d.uid = data.uid
      d.isProject = data.isProject
      d.isAuthenticated = data.isAuthenticated
      d.isOwner = data.uid === data.oid
    },
    subscribeToProjectChanges(data) {
      const { pid, oid } = data

      subscribeToDocSnapshot(pid, oid, (doc) => {
        const source = doc.data()
        Project.send("SNAPSHOT_UPDATED", { source })
      })
    },
    copyProject(data) {
      const { pid, oid, uid } = data
      const newPid = pid + "_copy"
      forkProject(pid, oid, uid, newPid)
    },
    forkProject(data) {
      const { pid, oid, uid } = data
      forkProject(pid, oid, uid, pid)
    },
    setCode(data, { globalId, code }) {
      data.code[globalId] = code
    },
    setName(data, { name }) {
      data.name = name
    },
    authenticate() {
      router.push("/auth")
    },
    updateFirebase(data) {
      const { pid, oid, code } = data

      updateProject(pid, oid, {
        jsx: JSON.stringify(code.jsx),
        statics: JSON.stringify(code.statics),
        theme: JSON.stringify(code.theme),
        code: JSON.stringify(code.state),
      })
    },
    setCaptiveTheme(data) {
      const { theme } = data.code

      try {
        const code = theme.slice(14)
        data.theme = Function("Static", `return ${code}`)(data.statics)
        data.error = ""
      } catch (err) {
        console.warn("Error building theme", err)
        data.error = err.message
      }
    },
    setStaticValues(data) {
      const { statics } = data.code

      try {
        data.statics = Function("Utils", `return ${statics}()`)(Utils)
        data.error = ""
      } catch (err) {
        console.warn("Error building statics", err)
        data.error = err.message
      }
    },
    setCaptiveState(data) {
      const { state } = data.code

      let code = state.slice(12, -2) // trim createState call

      try {
        data.captive = Function(
          "fn",
          "Static",
          "Utils",
          `return fn(${code})`
        )(createState, data.statics, Utils)
        data.error = ""
      } catch (err) {
        console.warn("Error building captive state", err)
        data.error = err.message
      }
    },
    updateFromFirebase(data, { source }) {
      data.code.jsx = JSON.parse(source.jsx)
      data.code.state = JSON.parse(source.code)
      data.code.statics = JSON.parse(
        source.statics?.startsWith('"function')
          ? source.statics
          : defaultStatics
      )
      data.code.theme = JSON.parse(source.theme || defaultTheme)
      data.name = source.name
    },
    updateStates(data) {
      const { jsx, state, theme, statics } = data.code
      JsxEditorState.send("REFRESHED", { code: jsx })
      StateEditorState.send("REFRESHED", { code: state })
      ThemeEditorState.send("REFRESHED", { code: theme })
      StaticsEditorState.send("REFRESHED", { code: statics })
      NameEditor.send("REFRESHED", { value: data.name })
    },
  },
})

// Project.onUpdate((state) => console.log(state.active))

/* -------------------------------------------------- */
/*                         UI                         */
/* -------------------------------------------------- */

export const UI = createState({
  data: {
    zoomedPath: "",
  },
  on: {
    ZOOMED_TO_NODE: "setZoomedPath",
  },
  states: {
    zoomedOut: {
      on: { ZOOMED_TO_NODE: { to: "zoomedIn" } },
    },
    zoomedIn: {
      on: { ZOOMED_OUT: { do: "clearZoomedPath", to: "zoomedOut" } },
    },
  },
  actions: {
    setZoomedPath(data, { path }) {
      data.zoomedPath = path
    },
    clearZoomedPath(data) {
      data.zoomedPath = ""
    },
  },
})

/* -------------------------------------------------- */
/*                       Editors                      */
/* -------------------------------------------------- */

export const StateEditorState = createCodeEditorState({
  defaultValue: "",
  onSave: (code) => {
    Project.send("CHANGED_CODE", { globalId: "state", code })
  },
  validate: (code) => {
    try {
      Function(
        "createState",
        "Static",
        "Utils",
        code
      )(createState, Project.data.statics, Utils)
    } catch (e) {
      throw e
    }
  },
})

export const JsxEditorState = createCodeEditorState({
  defaultValue: "",
  onSave: (code) => Project.send("CHANGED_CODE", { globalId: "jsx", code }),
  validate: () => "",
})

export const ThemeEditorState = createCodeEditorState({
  defaultValue: "",
  onSave: (code) => Project.send("CHANGED_CODE", { globalId: "theme", code }),
  validate: (code) => {
    try {
      Function("Utils", "Static", code)(Utils, Project.data.statics)
    } catch (e) {
      throw e
    }
  },
})

export const StaticsEditorState = createCodeEditorState({
  defaultValue: "",
  onSave: (code) => Project.send("CHANGED_CODE", { globalId: "statics", code }),
  validate: (code) => {
    try {
      Function("Utils", code)(Utils)
    } catch (e) {
      throw e
    }
  },
})

export const NameEditor = createSimpleEditorState({
  defaultValue: "",
  onSave: (name) => Project.send("CHANGED_NAME", { name }),
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
