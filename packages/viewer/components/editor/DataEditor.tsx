import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Box, Textarea } from "theme-ui"
import globalState from "./state"

export const DataEditor: React.FC<{ clean: string }> = ({ clean }) => {
  const state = useStateDesigner(
    {
      data: {
        dirty: clean,
        error: "",
      },
      on: {
        CHANGED_CODE: "setCode",
      },
      actions: {
        setError(data) {
          let error: string = ""

          try {
          } catch (e) {
            error = e.message
          }

          data.error = error
        },
        setCode(data, payload) {
          data.dirty = payload
        },
        saveCode(data) {
          globalState.send("CHANGED_CODE", data.dirty)
        },
      },
      states: {
        valid: {
          on: {
            SAVED: "saveCode",
          },
        },
        invalid: {},
      },
    },
    [clean]
  )

  return (
    <Box>
      {state.data.error}
      <Textarea
        sx={{ height: 128 }}
        value={state.data.dirty}
        onChange={(e) => state.send("CHANGED_CODE", e.target.value)}
      />
    </Box>
  )
}
