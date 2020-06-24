import { S, createState } from "@state-designer/core"

type UIData = {
  code: string
  captive?: S.DesignedState<any, any>
  hovered?: string
  error: string
  hinted: string[]
  active: string[]
  zoomed?: string
}

const initialData: UIData = {
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
    setCaptiveState(data, { code }) {
      data.code = code.slice(12, -2) // trim createState call
      try {
        const design = Function("return " + data.code)()
        data.error = ""
        data.captive = createState(design)
        data.zoomed = undefined
      } catch (e) {
        data.error = e.message
      }
    },
  },
})
