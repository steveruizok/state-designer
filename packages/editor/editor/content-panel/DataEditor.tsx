import * as React from "react"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import { Save, X } from "react-feather"
import { Input, Grid, IconButton } from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import { PanelHeading } from "../panel/PanelHeading"
import globalState from "../state"

export const DataEditor: React.FC<{
  code: string
  onChange: (code: string) => void
}> = ({ code, onChange }) => {
  const state = useStateDesigner(
    {
      data: {
        dirty: code,
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
          return data.dirty === code
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
          data.dirty = code
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
          onChange(data.dirty)
        },
      },
    },
    [code]
  )

  return (
    <>
      <PanelHeading title="Data">
        {state.isIn("editing") && (
          <Grid
            gap={2}
            sx={{
              alignItems: "center",
              gridTemplateColumns: "1fr auto auto",
              fontFamily: "monospace",
              borderRadius: 12,
            }}
          >
            <Input
              bg="transparent"
              readOnly
              sx={{ textAlign: "right" }}
              autoComplete={"off"}
              autoCapitalize={"off"}
              defaultValue={state.data.error}
            />
            <IconButton
              sx={{ height: 32, width: 32 }}
              disabled={!state.isIn("valid")}
              onClick={() => state.send("SAVED")}
            >
              <Save />
            </IconButton>
            <IconButton
              sx={{ height: 32, width: 32 }}
              onClick={() => state.send("CANCELLED")}
            >
              <X />
            </IconButton>
          </Grid>
        )}
      </PanelHeading>
      <Editor
        value={state.data.dirty}
        highlight={(code) => {
          return highlight(code, languages.js)
        }}
        padding={8}
        style={{
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
    </>
  )
}
