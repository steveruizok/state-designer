import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Save, X } from "react-feather"
import globalState from "./state"
import { InputRow } from "./shared"
import { Box, Input, Grid, Textarea, IconButton } from "theme-ui"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"

export const CodeEditor: React.FC<{
  name: string
  code: string
  validate?: (code: string) => boolean
  onChangeCode: (code: string) => void
  onChangeName: (name: string) => void
  optionsButton?: React.ReactElement
}> = ({ name, code, validate, onChangeCode, onChangeName, optionsButton }) => {
  const global = useStateDesigner(globalState)
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
          return validate === undefined ? true : validate(data.dirty)
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
            Function(
              "data",
              "payload",
              "result",
              "window",
              d.dirty
            )(global.values.data, null, null, {})
          } catch (e) {
            error = e.message
          }

          d.error = error
        },
        saveCode(data) {
          onChangeCode(data.dirty)
        },
      },
    },
    [code]
  )

  return (
    <Grid
      sx={{
        columnGap: 2,
        rowGap: 3,
        bg: "muted",
        gridTemplateColumns: "1fr auto auto",
        fontFamily: "monospace",
        p: 3,
        borderRadius: 12,
      }}
    >
      <Box sx={{ gridColumn: "span 3" }}>
        <InputRow
          defaultValue={name}
          onSubmit={(name) => onChangeName(name)}
          optionsButton={optionsButton}
        />
      </Box>
      <Box bg={"low"} sx={{ gridColumn: "span 3" }}>
        <Editor
          value={state.data.dirty}
          highlight={(code) => {
            return highlight(code, languages.js)
          }}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
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
      </Box>
      {state.isIn("editing") && (
        <>
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
        </>
      )}
    </Grid>
  )
}
