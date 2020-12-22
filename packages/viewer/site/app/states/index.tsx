// @refresh reset
import { createState } from "@state-designer/react"
import { createSimpleEditorState } from "./createSimpleEditorState"
import { createCodeEditorState } from "./createCodeEditorState"
import * as Types from "types"
import {
  defaultTheme,
  defaultTests,
  defaultStatics,
} from "../../static/defaults"
import {
  updateProject,
  subscribeToDocSnapshot,
  forkProject,
} from "lib/database"
import router from "next/router"
import * as Utils from "../../static/scope-utils"
import Colors from "../../static/colors"
import { expect } from "jest-lite"

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
    tests: [] as Test[],
    code: {
      state: "",
      jsx: "",
      theme: "",
      statics: "",
      tests: "",
      payloads: {} as Record<string, string>,
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
              "setTests",
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
            SNAPSHOT_UPDATED: ["updateFromFirebase", "updateStates"],
            CHANGED_PAYLOADS: [
              { unless: "isAuthenticated", break: true },
              "updatePayloads",
            ],
            CHANGED_CODE: [
              { unless: "isAuthenticated", break: true },
              "setCode",
              "setStaticValues",
              "setTests",
              "updateStates",
              "updateFirebase",
            ],
            CHANGED_NAME: "setName",
            INCREASED_CODE_SIZE: "increaseCodeSize",
            DECREASED_CODE_SIZE: "decreaseCodeSize",
          },
          states: {
            tabs: {
              initial: "state",
              on: {
                TABBED_TO_STATE: { to: "state" },
                TABBED_TO_JSX: { to: "jsx" },
                TABBED_TO_STATIC: { to: "static" },
                TABBED_TO_THEME: { to: "theme" },
                TABBED_TO_TESTS: { to: "tests" },
              },
              states: {
                state: {
                  on: {
                    CHANGED_CODE: [
                      { unless: "isAuthenticated", break: true },
                      "setStaticValues",
                      "setCaptiveState",
                      "setTests",
                    ],
                  },
                },
                jsx: {},
                tests: {
                  on: {
                    CHANGED_CODE: [
                      { unless: "isAuthenticated", break: true },
                      "setTests",
                    ],
                  },
                },
                static: {
                  on: {
                    CHANGED_CODE: [
                      { unless: "isAuthenticated", break: true },
                      "setStaticValues",
                      "setCaptiveTheme",
                      "setCaptiveState",
                      "setTests",
                    ],
                  },
                },
                theme: {
                  on: {
                    CHANGED_CODE: [
                      { unless: "isAuthenticated", break: true },
                      "setCaptiveTheme",
                    ],
                  },
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
      return data.isOwner && data.isAuthenticated
    },
  },
  actions: {
    clearProject(data) {
      data.error = ""
      data.pid = ""
      data.isOwner = false
    },
    setupProject(
      d,
      { user, response }: { user: Types.User; response: Types.ProjectResponse }
    ) {
      d.uid = user.uid
      d.error = ""
      d.pid = response.pid
      d.oid = response.oid
      d.isProject = response.isProject
      d.isAuthenticated = user.authenticated
      d.isOwner = user.uid === response.oid
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
    setCaptiveTheme(data) {
      const { theme } = data.code

      try {
        const code = theme.slice(14)
        data.theme = Function("Static", `return ${code}`)(data.statics)
        data.error = ""
      } catch (err) {
        console.error("Error building theme!", err.message)
        data.error = err.message
      }
    },
    setStaticValues(data) {
      const { statics } = data.code

      try {
        data.statics = Function(
          "Colors",
          "Utils",
          `${statics}\n\nreturn getStatic()`
        )(Colors, Utils)
        data.error = ""
      } catch (err) {
        console.error("Error building statics!", err.message)
        data.error = err.message
      }
    },
    setCaptiveState(data) {
      const { state } = data.code

      try {
        data.captive = Function(
          "createState",
          "Static",
          "Colors",
          "Utils",
          `return ${state}`
        )(createState, data.statics, Colors, Utils)
        data.error = ""
      } catch (err) {
        console.error("Error building captive state!", err.message)
        data.error = err.message
      }
    },
    setTests(data) {
      const { tests } = data.code
      const clone = data.captive.clone()

      let descriptions: Test[] = []

      function describe(name: Test["name"], test: Test["test"]) {
        const runTest = async () => {
          await test()
        }
        descriptions.push({
          name,
          test: runTest,
          state: "running",
          message: "",
        })
      }

      try {
        Function(
          "describe",
          "expect",
          "Static",
          "Colors",
          "Utils",
          "state",
          tests
        )(describe, expect, data.statics, Colors, Utils, clone)

        data.tests = descriptions
        data.error = ""
      } catch (err) {
        console.error("Error building tests!", err.message)
        data.error = err.message
      }
    },
    updateFirebase(data) {
      const { pid, oid, code, isAuthenticated } = data

      // Extra guard here...
      if (!isAuthenticated) return

      updateProject(pid, oid, {
        jsx: JSON.stringify(code.jsx),
        statics: JSON.stringify(code.statics),
        theme: JSON.stringify(code.theme),
        code: JSON.stringify(code.state),
        tests: JSON.stringify(code.tests),
      })
    },
    updateFromFirebase(data, { source }) {
      data.code.jsx = JSON.parse(source.jsx)
      data.code.state = JSON.parse(source.code)
      data.code.statics = JSON.parse(
        source.statics?.match(/function getStatic\(\)/gs)
          ? source.statics
          : defaultStatics
      )
      data.code.theme = JSON.parse(source.theme || defaultTheme)
      data.code.tests = JSON.parse(source.tests || defaultTests)
      data.name = source.name
    },
    updateStates(data) {
      const { jsx, state, theme, statics, tests } = data.code
      JsxEditorState.send("REFRESHED", { code: jsx })
      StateEditorState.send("REFRESHED", { code: state })
      ThemeEditorState.send("REFRESHED", { code: theme })
      StaticsEditorState.send("REFRESHED", { code: statics })
      TestsEditorState.send("REFRESHED", { code: tests })
      NameEditor.send("REFRESHED", { value: data.name })
    },
    updatePayloads(data, { payloads }) {
      data.code.payloads = payloads
    },
    decreaseCodeSize(data) {
      if (window.localStorage !== undefined) {
        const localFontSize = window.localStorage.getItem("sd_fontsize")
        window.localStorage.setItem(
          "sd_fontsize",
          localFontSize === null
            ? "12"
            : (parseInt(localFontSize) - 1).toString()
        )
      }

      JsxEditorState.send("DECREASED_CODE_SIZE")
      StateEditorState.send("DECREASED_CODE_SIZE")
      ThemeEditorState.send("DECREASED_CODE_SIZE")
      StaticsEditorState.send("DECREASED_CODE_SIZE")
      TestsEditorState.send("DECREASED_CODE_SIZE")
    },
    increaseCodeSize(data) {
      if (window.localStorage !== undefined) {
        const localFontSize = window.localStorage.getItem("sd_fontsize")
        window.localStorage.setItem(
          "sd_fontsize",
          localFontSize === null
            ? "14"
            : (parseInt(localFontSize) + 1).toString()
        )
      }

      JsxEditorState.send("INCREASED_CODE_SIZE")
      StateEditorState.send("INCREASED_CODE_SIZE")
      ThemeEditorState.send("INCREASED_CODE_SIZE")
      StaticsEditorState.send("INCREASED_CODE_SIZE")
      TestsEditorState.send("INCREASED_CODE_SIZE")
    },
  },
})

Project.onUpdate((state) => console.log(state.active))

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
    view: {
      initial: "split",
      states: {
        split: {},
        state: {},
        view: {},
        auto: {},
      },
      on: {
        SELECTED_SPLIT: { to: "split" },
        SELECTED_STATE: { to: "state" },
        SELECTED_VIEW: { to: "view" },
        SELECTED_AUTO: { to: "auto" },
      },
    },
    canvas: {
      initial: "zoomedOut",
      states: {
        zoomedOut: {
          on: { ZOOMED_TO_NODE: { to: "zoomedIn" } },
        },
        zoomedIn: {
          on: { ZOOMED_OUT: { do: "clearZoomedPath", to: "zoomedOut" } },
        },
      },
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
        "ColorMode",
        "Colors",
        "Utils",
        code
      )(createState, Project.data.statics, "dark", Colors, Utils)
    } catch (e) {
      throw e
    }
  },
})

// StateEditorState.onUpdate((state) => console.log(state.active))

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
      Function(
        "Colors",
        "Utils",
        "Static",
        code
      )(Colors, Utils, Project.data.statics)
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
      Function("Colors", "Utils", code)(Colors, Utils)
    } catch (e) {
      throw e
    }
  },
})

export const TestsEditorState = createCodeEditorState({
  defaultValue: "",
  onSave: (code) => Project.send("CHANGED_CODE", { globalId: "tests", code }),
  validate: (code) => {
    const clone = Project.data.captive.clone()

    let descriptions: Test[] = []

    function describe(name: Test["name"], test: Test["test"]) {
      descriptions.push({
        name,
        test: async () => await test(),
        state: "running",
        message: "",
      })
    }

    try {
      Function(
        "describe",
        "expect",
        "toBe",
        "Static",
        "Colors",
        "Utils",
        "state",
        code
      )(describe, expect, Project.data.statics, Colors, Utils, clone)
    } catch (e) {
      throw e
    }
  },
})

export const NameEditor = createSimpleEditorState({
  defaultValue: "",
  onSave: (name) => Project.send("CHANGED_NAME", { name }),
})

type Test = {
  name: string
  test: (() => void) | (() => Promise<void>)
  state: "running" | "pass" | "fail"
  message: ""
}
