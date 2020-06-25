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
  hinted: string[]
  active: string[]
  zoomed?: string
}

const initialData: UIData = {
  oid: "",
  uid: "",
  pid: "",
  code: "{}",
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
          to: "chart",
          do: "setCaptiveState",
        },
      },
    },
    ready: {
      initial: "chart",
      states: {
        chart: {
          on: {
            HOVERED_ON_NODE: {
              do: ["clearHoveredNode", "setHoveredNode"],
            },
            HOVERED_OFF_NODE: {
              do: "clearHoveredNode",
            },
            HOVERED_ON_EVENT: {
              do: ["clearHintedNodes", "setHintedNodes"],
            },
            HOVERED_OFF_EVENT: {
              do: "clearHintedNodes",
            },
            SELECTED_NODE: {
              do: "setCurrentNode",
            },
            CHANGED_CODE: {
              do: "setCaptiveState",
            },
            ZOOMED_ON_STATE: {
              do: "setCurrentNode",
            },
            ZOOMED_OUT: {
              do: "clearCurrentNode",
            },
            FORKED_PROJECT: {
              do: "forkProject",
            },
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
    setCaptiveState(d, { code, data }) {
      d.code = code.slice(12, -2) // trim createState call
      try {
        const design = Function("return " + d.code)()
        d.error = ""
        d.captive = createState(design)
        d.zoomed = undefined
        d.pid = data.pid
        d.oid = data.oid
        d.uid = data.uid
      } catch (e) {
        d.error = e.message
      }
    },
    async forkProject(data) {
      const { pid, oid, uid } = data
      await forkProject(pid, oid, uid)
    },
  },
})
