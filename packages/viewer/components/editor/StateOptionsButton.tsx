// @refresh reset
import * as React from "react"
import { MoreVertical } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import globalState, { State } from "./state"
import { SelectOptionHeader } from "./shared"
import { Box, IconButton } from "theme-ui"

export const StateOptionsButton: React.FC<{
  node: State
}> = ({ node }) => {
  const global = useStateDesigner(globalState)
  const parent = global.data.states.get(node.parent)

  return (
    <Box
      sx={{
        position: "relative",
        cursor: "pointer",
        height: "100%",
        width: "100%",
      }}
    >
      <select
        style={{ opacity: 0, width: 44, height: 40, cursor: "pointer" }}
        value={""}
        onChange={(e) => {
          switch (e.target.value) {
            case "move up": {
              globalState.send("MOVED_STATE", {
                stateId: node.id,
                delta: -1,
              })
              break
            }
            case "move down": {
              globalState.send("MOVED_STATE", {
                stateId: node.id,
                delta: 1,
              })
              break
            }
            case "delete": {
              globalState.send("DELETED_STATE", {
                stateId: node.id,
              })
              break
            }
          }
        }}
      >
        <SelectOptionHeader>{node.name}</SelectOptionHeader>
        {parent && node.index > 0 && <option value="move up">Move Up</option>}
        {parent && node.index < parent?.states.size - 1 && (
          <option value="move down">Move Down</option>
        )}
        <option value="delete">Delete</option>
      </select>
      <IconButton
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <MoreVertical />
      </IconButton>
    </Box>
  )
}
