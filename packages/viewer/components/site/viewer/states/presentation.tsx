// @refresh reset
import { jsx } from "theme-ui"
import { transform as _transform } from "buble"
import { createState } from "@state-designer/react"
import { updateProjectJsx } from "../../../../utils/firebase"

type Data = {
  oid: string
  uid: string
  pid: string
  isOwner: boolean
  clean: string
  dirty: string
  error: string
  element: any
}

const data: Data = {
  oid: "",
  uid: "",
  pid: "",
  isOwner: false,
  clean: "",
  dirty: "",
  error: "",
  element: undefined,
}

export const presentation = createState({
  data,
  initial: "guest",
  states: {
    guest: {},
    owner: {
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
    },
  },
  on: {
    REFRESHED_CODE: ["refreshCode"],
    LOADED_CODE: ["loadProject", { if: "isOwner", to: "owner" }],
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
      const code = JSON.parse(source.jsx)
      d.clean = code
      d.dirty = code
    },
    loadProject(d, { data, source }) {
      const code = JSON.parse(source.jsx)

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
    saveDirtyToClean(data) {
      data.clean = data.dirty
    },
    clearError(data) {
      data.error = ""
    },
    setError(data) {
      let err = ""
      data.error = err
    },
    updateFirebase(data) {
      const { pid, oid, uid } = data
      updateProjectJsx(pid, oid, uid, data.clean)
    },
  },
})
