import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Save, X } from "react-feather"
import globalState from "./state"
import { InputRow } from "./shared"
import { Box, Input, Grid, Textarea, IconButton } from "theme-ui"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import { PanelList } from "./panel/PanelList"
import { PanelItem } from "./panel/PanelItem"

export const DataEditor: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)
  const state = useStateDesigner(
    {
      data: {
        dirty: global.data.data,
        error: "",
      },
      initial: "idle",
      states: {
        idle: {
          on: { STARTED_EDITING: { to: "editing" } },
        },
        editing: {
          on: {
            CANCELLED: { to: "idle", do: "resetCode" },
            CHANGED_CODE: [
              "setCode",
              "setError",
              {
                if: "codeMatchesClean",
                to: "same",
                else: {
                  if: ["codeIsValid", "errorIsClear"],
                  to: "valid",
                  else: { to: "invalid" },
                },
              },
            ],
          },
          initial: "same",
          states: {
            same: {
              on: {
                SAVED: { to: "idle" },
                STOPPED_EDITING: { to: "idle" },
              },
            },
            valid: {
              on: { SAVED: { do: "saveCode", to: "idle" } },
            },
            invalid: {},
          },
        },
      },
      conditions: {
        codeIsValid(data) {
          return true
        },
        codeMatchesClean(data) {
          return data.dirty === global.data.data
        },
        errorIsClear(data) {
          return data.error === ""
        },
      },
      actions: {
        setCode(data, payload) {
          data.dirty = payload
        },
        resetCode(data) {
          data.dirty = global.data.data
        },
        setError(d) {
          let error: string = ""

          try {
            Function("return " + d.dirty)
          } catch (e) {
            error = e.message
          }

          d.error = error
        },
        saveCode(data) {
          global.send("CHANGED_DATA", data.dirty)
        },
      },
    },
    [global.data.data]
  )

  return (
    <PanelList title="Data">
      <Editor
        value={state.data.dirty}
        highlight={(code) => {
          return highlight(code, languages.js)
        }}
        padding={8}
        style={{
          backgroundColor: "#1d1d2d",
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
        }}
        onValueChange={(code) => state.send("CHANGED_CODE", code)}
        onFocus={() => state.send("STARTED_EDITING")}
        onBlur={() => state.send("STOPPED_EDITING")}
        onKeyPress={(e) => {
          if (e.shiftKey && e.key === "Enter" && state.can("SAVED")) {
            e.preventDefault()
            state.send("SAVED")
            e.currentTarget.blur()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === "Escape" && state.can("CANCELLED")) {
            e.preventDefault()
            state.send("CANCELLED")
            e.currentTarget.blur()
          }
        }}
      />
      {state.isIn("editing") && (
        <Grid
          gap={2}
          sx={{
            mt: 2,
            mx: 2,
            gridTemplateColumns: "1fr auto auto",
            fontFamily: "monospace",
            borderRadius: 12,
          }}
        >
          <Input
            bg="low"
            readOnly
            autoComplete={"off"}
            autoCapitalize={"off"}
            defaultValue={state.data.error}
          />
          <IconButton
            disabled={!state.isIn("valid")}
            onClick={() => state.send("SAVED")}
          >
            <Save />
          </IconButton>
          <IconButton onClick={() => state.send("CANCELLED")}>
            <X />
          </IconButton>
        </Grid>
      )}
    </PanelList>
  )
}
