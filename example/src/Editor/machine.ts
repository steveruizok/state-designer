import { useStateDesigner, createStateDesigner, Graph } from "state-designer"

export type Rect = {
  x: number
  y: number
  midX: number
  midY: number
  maxX: number
  maxY: number
}

export function getRect(div: HTMLDivElement) {
  return {
    x: div.offsetLeft,
    y: div.offsetTop,
    midX: div.offsetLeft + div.offsetWidth / 2,
    midY: div.offsetTop + div.offsetHeight / 2,
    maxX: div.offsetLeft + div.offsetWidth,
    maxY: div.offsetTop + div.offsetHeight
  }
}

export const EditorMachine = createStateDesigner({
  data: {
    graph: undefined as Graph.Export<any> | undefined,
    hoveredItem: undefined as { name: string; value: string } | undefined,
    hoveredState: undefined as string | undefined,
    transition: undefined as { name: string; ref: HTMLDivElement } | undefined,
    stateTargets: new Map<HTMLDivElement, { name: string } & Rect>(),
    transitionTargets: new Map<HTMLDivElement, { name: string } & Rect>()
  },
  on: {
    GRAPH_CHANGED: "updateGraph",
    ITEM_MOUSE_ENTER: "setHoveredItem",
    ITEM_MOUSE_LEAVE: "clearHoveredItem",
    STATE_MOUSE_ENTER: { if: "hoveredStateIsNew", do: "setHoveredState" },
    STATE_MOUSE_LEAVE: "clearHoveredState",
    TO_ITEM_MOUSE_ENTER: "setHoveredTransition",
    TO_ITEM_MOUSE_LEAVE: "clearHoveredTransition",
    REPORT_STATE_REF: "addStateRef",
    REPORT_TRANSITION_REF: "addTransitionRef"
  },
  actions: {
    updateGraph(data, graph) {
      data.graph = graph
    },
    addStateRef(data, { name, ref }) {
      data.stateTargets.set(ref, {
        name,
        ...getRect(ref)
      })
    },
    addTransitionRef(data, { name, ref }) {
      data.transitionTargets.set(ref, {
        name,
        ...getRect(ref)
      })
    },
    setHoveredItem(data, { type, name }) {
      console.log("hovering")
      if (!data.graph) return

      switch (type) {
        case "do":
          data.hoveredItem = data.graph.collections
            .find(collection => collection.name === "actions")
            ?.items.find(item => item.name === name)
          break
        case "get":
          data.hoveredItem = data.graph.collections
            .find(collection => collection.name === "results")
            ?.items.find(item => item.name === name)
          break
        case "if":
        case "ifAny":
        case "unless":
          data.hoveredItem = data.graph.collections
            .find(collection => collection.name === "conditions")
            ?.items.find(item => item.name === name)
          break
        default:
          break
      }
    },
    clearHoveredItem(data) {
      data.hoveredItem = undefined
    },
    setHoveredState(data, name) {
      data.hoveredState = name
    },
    clearHoveredState(data) {
      data.hoveredState = undefined
    },
    setHoveredTransition(data, { name, ref }) {
      data.transition = { name, ref }
    },
    clearHoveredTransition(data) {
      data.transition = undefined
    }
  },
  conditions: {
    hoveredStateIsNew(data, name) {
      return data.hoveredState !== name
    }
  }
})
