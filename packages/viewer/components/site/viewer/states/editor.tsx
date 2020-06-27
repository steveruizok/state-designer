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
    REFRESHED_CODE: "refreshCode",
    LOADED_CODE: ["loadProject", { if: "isOwner", to: "owner" }],
    CHANGED_CODE: ["setCode"],
    HOVERED_EVENT: {
      unless: "eventIsAlreadyHighlighted",
      do: "setHighlightedEvent",
    },
    UNHOVERED_EVENT: "clearHighlightedEvent",
    HOVERED_STATE: [
      {
        unless: "stateIsAlreadyHighlighted",
        do: "setHighlightedState",
      },
    ],
    UNHOVERED_STATE: "clearHighlightedState",
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
    stateIsAlreadyHighlighted(data, { stateName }) {
      return data.highlight.state === stateName
    },
    eventIsAlreadyHighlighted(data, { eventName }) {
      return data.highlight.event === eventName
    },
  },
  actions: {
    refreshCode(d, { source }) {
      const code = JSON.parse(source.code)
      d.clean = code
    },
    setHighlightedEvent(data, { eventName }) {
      console.log("Setting highlighted event")
      data.highlight.event = eventName
    },
    clearHighlightedEvent(data) {
      data.highlight.event = undefined
    },
    setHighlightedState(data, { stateName }) {
      console.log("Setting highlighted state")
      data.highlight.state = stateName
    },
    clearHighlightedState(data) {
      data.highlight.state = undefined
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
