import React from "react"
import { TodoContainer, RemoveButton, Checkbox, TextInput } from "components"
import { useStateDesigner } from "@state-designer/react"
import global from "./globalState"

export default function ({ id = 0, content = "", complete = false }) {
  const state = useStateDesigner({
    data: {
      id,
      content,
      complete,
    },
    initial: complete ? "complete" : "incomplete",
    states: {
      incomplete: {
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
            on: {
              TOGGLED_COMPLETE: {
                to: "complete",
                do: "setComplete",
              },
              CHANGED_CONTENT: {
                if: "contentIsEmpty",
                to: "empty",
              },
            },
          },
        },
        on: {
          CHANGED_CONTENT: "updateContent",
        },
      },
      complete: {
        on: {
          TOGGLED_COMPLETE: {
            do: "clearComplete",
            to: "incomplete",
          },
        },
      },
    },
    conditions: {
      contentIsEmpty(data) {
        return data.content === ""
      },
    },
    actions: {
      setComplete(data) {
        data.complete = true
      },
      clearComplete(data) {
        data.complete = false
      },
      updateContent(data, payload) {
        data.content = payload
      },
    },
  })

  React.useEffect(() => {
    global.send("UPDATED_TODO", state.data)
  }, [state.data.complete])

  return (
    <TodoContainer>
      {state.whenIn({
        empty: (
          <RemoveButton
            onClick={() => global.send("REMOVED_TODO", state.data)}
          />
        ),
        default: (
          <Checkbox
            isChecked={state.isIn("complete")}
            disabled={state.isIn("empty")}
            onChange={() => state.send("TOGGLED_COMPLETE")}
          />
        ),
      })}
      <TextInput
        disabled={state.isIn("complete")}
        value={state.data.content}
        onChange={(e) => state.send("CHANGED_CONTENT", e.target.value)}
      />
    </TodoContainer>
  )
}
