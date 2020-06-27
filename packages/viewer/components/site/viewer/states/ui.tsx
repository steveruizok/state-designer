// @refresh reset
import { S, createState } from "@state-designer/core"
import { forkProject } from "../../../../utils/firebase"

type UIData = {
  oid: string
  uid: string
  pid: string
  code: string
  captive?: S.DesignedState<any, any>
  hovered?: string
  error: string
  isOwner: boolean
  hinted: string[]
  active: string[]
  zoomed?: string
}

const initialData: UIData = {
  oid: "",
  uid: "",
  pid: "",
  code: "{}",
  isOwner: false,
  error: "",
  captive: createState({}),
  hovered: undefined,
  hinted: [],
  active: [],
  zoomed: undefined,
}

export const ui = createState({
  data: initialData,
  initial: "loading",
  states: {
    loading: {
      on: {
        LOADED_PROJECT: {
          to: "state",
          do: "setCaptiveState",
        },
      },
    },
    ready: {
      initial: "state",
      states: {
        presentation: {
          on: {
            TABBED_TO_STATE: {
              to: "state",
            },
          },
        },
        state: {
          on: {
            TABBED_TO_PRESENTATION: {
              to: "presentation",
            },
            HOVERED_ON_NODE: ["clearHoveredNode", "setHoveredNode"],
            HOVERED_OFF_NODE: "clearHoveredNode",
            HOVERED_ON_EVENT: ["clearHintedNodes", "setHintedNodes"],
            HOVERED_OFF_EVENT: "clearHintedNodes",
            SELECTED_NODE: "setCurrentNode",
            REFRESHED_CODE: "setCaptiveState",
            CHANGED_CODE: "setCaptiveState",
            ZOOMED_ON_STATE: "setCurrentNode",
            ZOOMED_OUT: "clearCurrentNode",
            FORKED_PROJECT: "forkProject",
          },
        },
        code: {},
      },
    },
  },
  actions: {
    clearHoveredNode(data) {
      data.hovered = undefined
    },
    setHoveredNode(data, { id }) {
      data.hovered = id
    },
    clearHintedNodes(data) {
      data.hinted = []
    },
    setHintedNodes(data, { ids }) {
      data.hinted = ids
    },
    clearCurrentNode(data) {
      data.zoomed = undefined
    },
    setCurrentNode(data, { path }) {
      data.zoomed = path
    },
    setCaptiveState(d, { source, data }) {
      const { code } = source
      d.code = JSON.parse(code).slice(12, -2) // trim createState call

      try {
        const design = Function("return " + d.code)()
        d.captive = createState(design)
      } catch (e) {
        console.warn("Error building captive state", e)
        d.error = e.message
      }

      d.error = ""
      d.zoomed = undefined
      d.pid = data.pid
      d.oid = data.oid
      d.uid = data.uid
      d.isOwner = data.uid === data.oid
    },
    async forkProject(data) {
      const { pid, oid, uid } = data
      await forkProject(pid, oid, uid)
    },
  },
})
