import React from "react"
import * as safeEval from "safe-eval"
import { Box, Button, Input } from "@theme-ui/components"
import { useStateDesigner } from "state-designer"

export interface Props {
  active: boolean
  value: string
  enabled: (name: string, payload?: any) => boolean
  onClick: (name: string, payload?: any) => void
}

export const EventButton: React.FC<Props> = ({
  active,
  value,
  enabled,
  onClick
}) => {
  const [data, send, { isIn }] = useStateDesigner({
    data: {
      payloadData: undefined as any,
      payload: "",
      error: ""
    },
    on: {},
    states: {
      payload: {
        initial: "valid",
        states: {
          valid: {
            on: {
              BUTTON_CLICKED: [
                {
                  if: "codeIsValid",
                  do: data => {
                    onClick(value, data.payload ? data.payloadData : undefined)
                  }
                }
              ]
            }
          },
          invalid: {}
        }
      },
      editing: {
        initial: "closed",
        states: {
          closed: {
            on: {
              TOGGLE_PAYLOAD: { to: "open" }
            }
          },
          open: {
            on: {
              UPDATE_PAYLOAD: [
                "updatePayload",
                "updateError",
                "updateData",
                {
                  if: "codeIsValid",
                  to: "valid"
                },
                {
                  unless: "codeIsValid",
                  to: "invalid"
                }
              ],
              TOGGLE_PAYLOAD: { to: "closed" }
            }
          }
        }
      }
    },
    actions: {
      updatePayload: (data, code) => {
        data.payload = code
      },
      updateError: data => {
        let error = ""

        try {
          safeEval(data.payload)
        } catch (e) {
          error = e.message
        }

        data.error = error
      },
      updateData: data => {
        if (data.error === "") {
          data.payloadData = safeEval(data.payload)
        }
      }
    },
    conditions: {
      codeIsValid: data => {
        return data.error === ""
      }
    }
  })

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto"
      }}
    >
      <Button
        variant={"event"}
        disabled={
          !active || isIn("invalid") || !enabled(value, data.payloadData)
        }
        onClick={() => send("BUTTON_CLICKED")}
        sx={{ width: "fit-content" }}
      >
        {value}
      </Button>
      {isIn("editing.open") && (
        <Box sx={{ position: "relative" }}>
          <Input
            px={2}
            disabled={!active}
            value={data.payload}
            onChange={e => send("UPDATE_PAYLOAD", e.target.value)}
            variant="inputs.event"
          />
        </Box>
      )}
      <Button
        variant={"secondary"}
        px={1}
        disabled={!active}
        sx={{
          width: "24px",
          borderRadius: "0 4px 4px 0"
        }}
        onClick={() => send("TOGGLE_PAYLOAD")}
      >
        {isIn("editing.open") ? "" : data.payload}
      </Button>
    </Box>
  )
}
