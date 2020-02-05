import * as React from "react"
import { useStateDesigner, Graph } from "state-designer"
import "./styles.css"

import EditorState from "./editor-state"

const Editor: React.FC<{ initialValue: string }> = ({
  initialValue = '"In passing: two words, common but singular."'
}) => {
  const { data, send, isIn, can, graph } = useStateDesigner({
    data: {
      private: initialValue,
      public: initialValue
    },
    initial: "saved",
    states: {
      saved: {
        onEnter: "resetPublic"
      },
      unsaved: {
        initial: "invalid",
        states: {
          valid: {
            on: { CHANGES_SAVED: { do: "savePublic", to: "saved" } }
          },
          invalid: {}
        },
        on: { CHANGES_CANCELED: { do: "resetPublic", to: "saved" } }
      }
    },
    on: {
      INPUT_VALUE_CHANGED: [
        "updatePublic",
        {
          if: ["publicIsValid", "publicIsNewValue"],
          to: "unsaved.valid"
        },
        {
          unless: ["publicIsValid", "publicIsNewValue"],
          to: "unsaved.invalid"
        }
      ]
    },
    conditions: {
      publicIsValid(data) {
        return data.public.length > 0
      },
      publicIsNewValue(data) {
        return data.public === data.private
      }
    },
    actions: {
      savePublic(data) {
        data.private = data.public
      },
      resetPublic(data) {
        data.public = data.private
      },
      updatePublic(data, payload) {
        data.public = payload
      }
    }
  })

  return (
    <div>
      <div className="button-group">
        <input
          value={data.public}
          onChange={e => send("CHANGE", e.target.value)}
          style={{ width: 360 }}
        />
        {isIn("unsaved") && (
          <>
            <button disabled={!can("CANCEL")} onClick={() => send("CANCEL")}>
              Cancel
            </button>
            <button disabled={!can("SAVE")} onClick={() => send("SAVE")}>
              Save
            </button>
          </>
        )}
      </div>
      <pre>{JSON.stringify(graph, null, 2)}</pre>
      <EditorGraph graph={graph} />
    </div>
  )
}

export default Editor

type Rect = {
  x: number
  y: number
  midX: number
  midY: number
  maxX: number
  maxY: number
}

function getRect(div: HTMLDivElement) {
  return {
    x: div.offsetLeft,
    y: div.offsetTop,
    midX: div.offsetLeft + div.offsetWidth / 2,
    midY: div.offsetTop + div.offsetHeight / 2,
    maxX: div.offsetLeft + div.offsetWidth,
    maxY: div.offsetTop + div.offsetHeight
  }
}

const EditorGraph: React.FC<{ graph: Graph.Export<any> }> = ({ graph }) => {
  const { data, send } = useStateDesigner({
    data: {
      hoveredItem: undefined as { name: string; value: string } | undefined,
      hoveredState: undefined as string | undefined,
      transition: undefined as
        | { name: string; ref: HTMLDivElement }
        | undefined,
      stateTargets: [] as ({ name: string } & Rect)[],
      transitionTargets: new Map<HTMLDivElement, { name: string } & Rect>()
    },
    on: {
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
      addStateRef(data, { name, ref }) {
        data.stateTargets.push({
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
        switch (type) {
          case "do":
            data.hoveredItem = graph.collections
              .find(collection => collection.name === "actions")
              ?.items.find(item => item.name === name)
            break
          case "get":
            data.hoveredItem = graph.collections
              .find(collection => collection.name === "results")
              ?.items.find(item => item.name === name)
            break
          case "if":
          case "ifAny":
          case "unless":
            data.hoveredItem = graph.collections
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

  const [size, setSize] = React.useState({ width: 100, height: 100 })

  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const { current } = ref
    if (current === null) return

    setSize({
      width: current.offsetWidth,
      height: current.offsetHeight
    })
  }, [graph])

  const { transition } = data
  const from = transition && data.transitionTargets.get(transition.ref)
  const to =
    transition &&
    data.stateTargets.find(state => state.name.endsWith("." + transition.name))

  return (
    <div ref={ref} className="list-horizontal" style={{ position: "relative" }}>
      <div className="status-bar">Editor — {data.hoveredState}</div>
      <div className="collections container">
        {data.hoveredItem ? (
          <div className="list">
            <div className="list padded">
              <div className="container">
                <div className="list-header">{data.hoveredItem.name}</div>
                <pre className="padded scroll-x">
                  <code>{data.hoveredItem.value}</code>
                </pre>
              </div>
            </div>
          </div>
        ) : (
          graph.collections.map((collection, index) => (
            <div className="list" key={index}>
              <div className="list-header">{collection.name}</div>
              <div className="list padded">
                {collection.items.map((item, index) => (
                  <div className="container" key={index}>
                    <div className="list-header">{item.name}</div>
                    <pre className="padded  scroll-x">
                      <code>{item.value}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <EditorState
        state={graph}
        transitionTarget={transition?.name}
        onMouseEnter={name => send("STATE_MOUSE_ENTER", name)}
        onMouseLeave={() => send("STATE_MOUSE_LEAVE")}
        onToMouseEnter={(name, ref) =>
          send("TO_ITEM_MOUSE_ENTER", { name, ref })
        }
        onToMouseLeave={() => send("TO_ITEM_MOUSE_LEAVE")}
        reportStateRef={(name, ref) => send("REPORT_STATE_REF", { name, ref })}
        reportTransitionRef={(name, ref) =>
          send("REPORT_TRANSITION_REF", { name, ref })
        }
        onItemMouseEnter={(name, type) =>
          send("ITEM_MOUSE_ENTER", { name, type })
        }
        onItemMouseLeave={() => send("ITEM_MOUSE_LEAVE")}
      />

      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          ...size,
          pointerEvents: "none"
        }}
      >
        <defs>
          <marker
            id="circle-dark"
            markerWidth="16"
            markerHeight="16"
            refX="4"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <circle cx={4} cy={4} r={4} fill="#000" />
          </marker>
          <marker
            id="circle"
            markerWidth="16"
            markerHeight="16"
            refX="4"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <circle cx={4} cy={4} r={4} fill="rgb(0, 0, 0, .1)" />
          </marker>
          <marker
            id="arrow-dark"
            markerWidth="12"
            markerHeight="12"
            refX="6"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,7 L7,4 z" fill="#000" />
          </marker>
          <marker
            id="arrow"
            markerWidth="12"
            markerHeight="12"
            refX="6"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,7 L7,4 z" fill="rgb(0, 0, 0, .1)" />
          </marker>
        </defs>
        {Array.from(data.transitionTargets.entries()).map(
          ([_, from], index) => {
            const to = data.stateTargets.find(state =>
              state.name.endsWith("." + from.name)
            )

            return to && <ConnectingLine key={index} to={to} from={from} />
          }
        )}
        {transition && from && to && (
          <ConnectingLine dark to={to} from={from} />
        )}
      </svg>
    </div>
  )
}

const ConnectingLine: React.FC<{ to: Rect; from: Rect; dark?: boolean }> = ({
  to,
  from,
  dark = false
}) => {
  return (
    <line
      x1={from.maxX - 12}
      y1={from.midY}
      x2={from.maxX < to.x ? to.x : from.x > to.maxX ? to.maxX : to.midX}
      y2={from.maxY < to.y ? to.y : from.y > to.maxY ? to.maxY : to.midY}
      stroke={dark ? "#000" : "rgb(0, 0, 0, .1)"}
      strokeWidth={1}
      markerStart={dark ? "url(#circle-dark)" : "url(#circle)"}
      markerEnd={dark ? "url(#arrow-dark)" : "url(#arrow)"}
    />
  )
}
