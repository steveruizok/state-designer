import * as React from "react"
import {
  createState,
  useStateDesigner,
  StateGraph,
} from "@state-designer/react"

export function Todo({ id = 0, content = "", complete = false }) {
  const state = useStateDesigner(
    {
      data: {
        id,
        content,
      },
      initial: complete ? "complete" : "incomplete",
      states: {
        incomplete: {
          on: {
            CHANGED_CONTENT: { do: "setContent" },
          },
          initial: {
            if: "contentIsEmpty",
            to: "empty",
            else: { to: "full" },
          },
          states: {
            empty: {
              on: {
                CHANGED_CONTENT: {
                  unless: "contentIsEmpty",
                  to: "full",
                },
              },
            },
            full: {
              onEnter: () => console.log("in fyul!"),
              on: {
                TOGGLED_COMPLETE: { to: "complete" },
                CHANGED_CONTENT: {
                  if: "contentIsEmpty",
                  to: "empty",
                },
              },
            },
          },
        },
        complete: {
          on: {
            TOGGLED_COMPLETE: { to: "incomplete" },
          },
        },
      },
      conditions: {
        contentIsEmpty(data) {
          return data.content === ""
        },
      },
      actions: {
        setContent(data, payload) {
          data.content = payload
        },
      },
    },
    []
  )

  return (
    <div style={{ margin: 24 }}>
      <input
        type="checkbox"
        disabled={state.isIn("empty")}
        checked={state.isIn("complete")}
        onChange={() => state.send("TOGGLED_COMPLETE")}
      />
      <input
        disabled={state.isIn("complete")}
        value={state.data.content}
        onChange={(e) => state.send("CHANGED_CONTENT", e.target.value)}
      />
      <StateGraph state={state} />
    </div>
  )
}
