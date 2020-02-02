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
            on: { SAVE: { do: "savePublic", to: "saved" } }
          },
          invalid: {}
        },
        on: { CANCEL: { do: "resetPublic", to: "saved" } }
      }
    },
    on: {
      CHANGE: [
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

const EditorGraph: React.FC<{ graph: Graph.Node }> = ({ graph }) => {
  const { data, send } = useStateDesigner({
    data: {
      transition: undefined as
        | { name: string; ref: HTMLDivElement }
        | undefined,
      stateTargets: [] as ({ name: string } & Rect)[],
      transitionTargets: new Map<HTMLDivElement, { name: string } & Rect>()
    },
    on: {
      TO_ITEM_MOUSE_ENTER: "setHoveredTransition",
      TO_ITEM_MOUSE_LEAVE: "clearHoveredTransition",
      REPORT_STATE_REF: (data, { name, ref }) => {
        data.stateTargets.push({
          name,
          ...getRect(ref)
        })
      },
      REPORT_TRANSITION_REF: (data, { name, ref }) => {
        data.transitionTargets.set(ref, {
          name,
          ...getRect(ref)
        })
      }
    },
    actions: {
      setHoveredTransition(data, { name, ref }) {
        data.transition = { name, ref }
      },
      clearHoveredTransition(data) {
        data.transition = undefined
      }
    }
  })

  const [size, setSize] = React.useState({ width: 100, height: 100 })

  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const { current } = ref

    if (current === null) {
      return
    }

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
    <div ref={ref} style={{ position: "relative" }}>
      <EditorState
        state={graph}
        transitionTarget={transition?.name}
        onToMouseEnter={(name: string, ref: HTMLDivElement) =>
          send("TO_ITEM_MOUSE_ENTER", { name, ref })
        }
        onToMouseLeave={() => send("TO_ITEM_MOUSE_LEAVE")}
        reportStateRef={(name, ref) => send("REPORT_STATE_REF", { name, ref })}
        reportTransitionRef={(name, ref) =>
          send("REPORT_TRANSITION_REF", { name, ref })
        }
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
            id="circle"
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
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,7 L7,4 z" fill="#000" />
          </marker>
        </defs>
        {Array.from(data.transitionTargets.entries()).map(
          ([div, from], index) => {
            const to = data.stateTargets.find(state =>
              state.name.endsWith("." + from.name)
            )

            return (
              to && (
                <line
                  key={index}
                  x1={from.maxX - 12}
                  y1={from.midY}
                  x2={to.midX + (to.x > from.maxX ? -40 : 40)}
                  y2={to.y > from.maxY ? to.y + 12 : to.maxY - 4}
                  stroke={"rgba(0,0,0,.1)"}
                  strokeWidth={1}
                  markerStart="url(#circle)"
                  markerEnd="url(#arrow)"
                />
              )
            )
          }
        )}
        {transition && from && to && (
          <line
            x1={from.maxX - 12}
            y1={from.midY}
            x2={to.midX + (to.x > from.maxX ? -40 : 40)}
            y2={to.y > from.maxY ? to.y + 12 : to.maxY - 4}
            stroke="#000"
            strokeWidth={1}
            markerStart="url(#circle)"
            markerEnd="url(#arrow)"
          />
        )}
      </svg>
    </div>
  )
}
