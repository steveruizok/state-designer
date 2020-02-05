import * as React from "react"
import { useStateDesigner, createStateDesigner, Graph } from "state-designer"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { ghcolors } from "react-syntax-highlighter/dist/esm/styles/prism"

import "./styles.css"

import EditorState from "./editor-state"
import { EditorMachine } from "./machine"

const Editor: React.FC<{}> = ({}) => {
  const { data, send, isIn, can, graph } = useStateDesigner({
    data: {
      private: "In passing: two words, common but singular.",
      public: "In passing: two words, common but singular."
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
          to: "unsaved.invalid"
        }
      ]
    },
    conditions: {
      publicIsValid(data) {
        return data.public.length > 0
      },
      publicIsNewValue(data) {
        return data.public !== data.private
      }
    },
    actions: {
      savePublic(data) {
        data.private = data.public
      },
      resetPublic(data) {
        data.public = data.private
      },
      updatePublic(data, payload = "") {
        data.public = payload
      }
    }
  })

  return (
    <div>
      <EditorGraph graph={graph} send={send}>
        <div className="button-group">
          <input
            value={data.public}
            onChange={e => {
              send("INPUT_VALUE_CHANGED", e.target.value)
            }}
            style={{ width: 360 }}
          />
          {isIn("unsaved") && (
            <>
              <button
                disabled={!can("CHANGES_CANCELED")}
                onClick={() => send("CHANGES_CANCELED")}
              >
                Cancel
              </button>
              <button
                disabled={!can("CHANGES_SAVED")}
                onClick={() => send("CHANGES_SAVED")}
              >
                Save
              </button>
            </>
          )}
        </div>
      </EditorGraph>
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

const EditorGraph: React.FC<{
  graph: Graph.Export<any>
  send: (event: string, payload?: any) => void
}> = ({ graph, children }) => {
  const { data, send } = useStateDesigner(EditorMachine)
  const ref = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState({ width: 100, height: 100 })

  React.useEffect(() => {
    const { current } = ref
    if (current === null) return

    setSize({
      width: current.offsetWidth,
      height: current.offsetHeight
    })

    send("GRAPH_CHANGED", graph)
  }, [graph])

  const { transition } = data
  const from = transition && data.transitionTargets.get(transition.ref)
  const to =
    transition &&
    Array.from(data.stateTargets.values()).find(state =>
      state.name.endsWith("." + transition.name)
    )

  return (
    <div ref={ref} className="layout" style={{ position: "relative" }}>
      <div className="status-bar">Editor — {data.hoveredState}</div>
      <div className="sidebar">
        <div className="collections">
          {data.hoveredItem ? (
            <div className="list">
              <div className="list padded">
                <div className="container">
                  <div className="list-header">{data.hoveredItem.name}</div>
                  <SyntaxHighlighter
                    language="javascript"
                    style={ghcolors}
                    customStyle={{
                      border: 0,
                      margin: 0
                    }}
                    codeTagProps={{
                      style: { fontSize: 12, fontWeight: 500 }
                    }}
                  >
                    {data.hoveredItem.value}
                  </SyntaxHighlighter>
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
                      <SyntaxHighlighter
                        language="javascript"
                        style={ghcolors}
                        customStyle={{
                          border: 0,
                          margin: 0
                        }}
                        codeTagProps={{
                          style: { fontSize: 12, fontWeight: 500 }
                        }}
                      >
                        {item.value}
                      </SyntaxHighlighter>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="component-preview">{children}</div>
      <div className="content">
        <div className="graph">
          <EditorState state={graph} />
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
                <circle cx={4} cy={4} r={4} fill="#E5E5E5" />
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
                <path d="M0,0 L0,7 L7,4 z" fill="#E5E5E5" />
              </marker>
            </defs>
            {Array.from(data.transitionTargets.entries()).map(
              ([_, from], index) => {
                const to = Array.from(data.stateTargets.values()).find(state =>
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
      </div>
      <div className="data">
        <SyntaxHighlighter
          language="javascript"
          style={ghcolors}
          customStyle={{
            border: 0,
            margin: 0
          }}
          codeTagProps={{
            style: { fontSize: 12, fontWeight: 500 }
          }}
        >
          {JSON.stringify(data.graph?.data, null, 2)}
        </SyntaxHighlighter>
      </div>
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
