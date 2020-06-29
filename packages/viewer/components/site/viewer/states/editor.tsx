// @refresh reset
import { createState } from "@state-designer/core"
import { updateProjectCode } from "../../../../utils/firebase"

type Data = {
  highlight: {
    state?: string
    event?: string
  }
  oid: string
  uid: string
  pid: string
  isOwner: boolean
  clean: string
  dirty: string
  error: string
}

const data: Data = {
  highlight: {
    state: undefined,
    event: undefined,
  },
  oid: "",
  uid: "",
  pid: "",
  isOwner: false,
  clean: "",
  dirty: "",
  error: "",
}

export const editor = createState({
  data,
  initial: "guest",
  states: {
    guest: {},
    owner: {
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
        same: {},
        valid: {
          on: {
            CANCELLED: { do: "resetCode", to: "owner" },
            QUICK_SAVED: [
              "saveDirtyToClean",
              "updateFirebase",
              { to: "owner" },
            ],
            SAVED: ["saveDirtyToClean", "updateFirebase", { to: "owner" }],
          },
        },
        invalid: {
          on: {
            CANCELLED: { do: ["resetCode", "clearError"], to: "owner" },
          },
        },
      },
      on: {
        CHANGED_CODE: ["setCode", "setError", { to: "owner" }],
      },
    },
  },
  on: {
    REFRESHED_CODE: "refreshCode",
    LOADED_CODE: ["loadProject", { if: "isOwner", to: "owner" }],
    CHANGED_CODE: ["setCode"],
  },
  conditions: {
    codeMatchesClean(data) {
      return data.dirty === data.clean
    },
    errorIsClear(data) {
      return data.error === ""
    },
    isOwner(data) {
      return data.isOwner
    },
  },
  actions: {
    refreshCode(d, { source }) {
      const code = JSON.parse(source.code)
      d.clean = code
    },
    loadProject(d, { source, data }) {
      const code = JSON.parse(source.code)

      d.uid = data.uid
      d.oid = data.oid
      d.pid = data.pid
      d.isOwner = data.isOwner
      d.clean = code
      d.dirty = code
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
    formatCode(data) {},
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
      const { pid, oid, uid } = data
      updateProjectCode(pid, oid, uid, data.clean)
    },
  },
})
