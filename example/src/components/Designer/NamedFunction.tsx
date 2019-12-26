import React from "react"
import { Box, Button } from "rebass"
import { Label, Input } from "@rebass/forms"
import { StateDesigner, useStateDesigner } from "state-designer"
import { NamedFunctionConfig } from "./machines/namedFunction"

export const NamedFunction: React.FC<{
  state: StateDesigner<NamedFunctionConfig>
  onMoveUp: any
  onMoveDown: any
  canMoveUp: boolean
  canMoveDown: boolean
}> = ({
  state,
  onMoveDown = () => {},
  onMoveUp = () => {},
  canMoveDown,
  canMoveUp
}) => {
  const { data, send } = useStateDesigner(state)
  const { id, editing, dirty, clean } = data

  return (
    <Box
      p={1}
      as="li"
      my={2}
      sx={{ border: "1px solid #ccc", borderRadius: 8 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "min-content 1fr",
          columnGap: 2,
          rowGap: 2,
          alignItems: "center"
        }}
      >
        {editing ? (
          <>
            <Label htmlFor="namedFuctionName">Name</Label>
            <Input
              name="namedFuctionName"
              type="text"
              value={dirty.name}
              onChange={(e: any) =>
                send("UPDATE_NAME", e.target.value.toUpperCase())
              }
            />
            <Label htmlFor="namedFunctionCode">Code</Label>
            <Input
              name="namedFunctionCode"
              type="text"
              value={dirty.code}
              onChange={(e: any) => send("UPDATE_CODE", e.target.value)}
            />
            <Box
              sx={{
                display: "grid",
                gridColumn: "span 2",
                gridAutoFlow: "column",
                gap: 1
              }}
            >
              <Button onClick={() => send("CANCEL")}>Cancel</Button>
              <Button onClick={() => send("SAVE")}>Save</Button>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridColumn: "span 2",
              gridAutoFlow: "column",
              gap: 1
            }}
          >
            <Input
              name="namedFuctionName"
              type="text"
              value={clean.name}
              disabled={true}
            />
            <Button onClick={() => send("EDIT")}>Edit</Button>
            <Button
              disabled={!canMoveDown}
              opacity={canMoveDown ? 1 : 0.5}
              onClick={onMoveDown}
            >
              ▼
            </Button>
            <Button
              disabled={!canMoveUp}
              opacity={canMoveUp ? 1 : 0.5}
              onClick={onMoveUp}
            >
              ▲
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}
