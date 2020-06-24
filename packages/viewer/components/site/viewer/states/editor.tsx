import { createState } from "@state-designer/core"
import initFirebase from "../../../../auth/initFirebase"
import firebase from "firebase"

initFirebase()

const db = firebase.firestore()

export const editor = createState({
  data: {
    projectId: "",
    clean: "",
    dirty: "",
    error: "",
  },
  initial: "idle",
  states: {
    idle: {
      on: { STARTED_EDITING: { to: "editing" } },
    },
    editing: {
      on: {
        CHANGED_CODE: ["setCode", "setError", { to: "editing" }],
      },
      initial: {
        if: "codeMatchesClean",
        to: "same",
        else: {
          if: "errorIsClear",
          to: "valid",
          else: { to: "invalid" },
        },
      },
      states: {
        same: {
          on: {
            STOPPED_EDITING: { to: "idle" },
          },
        },
        valid: {
          on: {
            CANCELLED: { do: "resetCode", to: "idle" },
            QUICK_SAVED: [
              "saveDirtyToClean",
              "updateFirebase",
              { to: "editing" },
            ],
            SAVED: ["saveDirtyToClean", "updateFirebase", { to: "idle" }],
          },
        },
        invalid: {
          on: {
            CANCELLED: { do: ["resetCode", "clearError"], to: "idle" },
          },
        },
      },
    },
  },
  on: {
    LOADED_CODE: ["loadProject"],
    CHANGED_CODE: ["setCode"],
  },
  conditions: {
    codeMatchesClean(data) {
      return data.dirty === data.clean
    },
    errorIsClear(data) {
      return data.error === ""
    },
  },
  actions: {
    loadProject(data, { pid, code }) {
      console.log("loading project code", pid, code)
      data.projectId = pid
      data.clean = code
      data.dirty = code
    },
    setCleanCode(data, payload) {
      data.clean = payload
    },
    setCode(data, { code }) {
      data.dirty = code
    },
    resetCode(data) {
      data.dirty = data.clean
    },
    saveDirtyToClean(data) {
      data.clean = data.dirty
    },
    clearError(data) {
      data.error = ""
    },
    setError(d) {
      let error: string = ""

      try {
        Function("fn", `fn(${d.dirty.slice(12, -2)})`)(createState)
      } catch (e) {
        error = e.message
      }

      d.error = error
    },
    updateFirebase(data) {
      console.log(data.projectId)
      db.collection("projects")
        .doc(data.projectId)
        .update({
          code: JSON.stringify(data.clean),
        })
    },
  },
})
