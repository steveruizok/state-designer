// @refresh reset
import * as React from "react"
import { MoreVertical } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import globalState from "./state"
import * as T from "./types"
import { Box, IconButton } from "theme-ui"
import { SelectOptionHeader } from "./shared"

export const EventOptionsButton: React.FC<{
  event: T.SendEvent
}> = ({ event }) => {
  const global = useStateDesigner(globalState)

  return (
    <Box sx={{ position: "relative" }}>
      <select
        style={{ opacity: 0, width: 44, height: 40 }}
        value={""}
        onChange={(e) => {
          switch (e.target.value) {
            case "move up": {
              globalState.send("MOVED_EVENT", {
                eventId: event.id,
                delta: -1,
              })
              break
            }
            case "move down": {
              globalState.send("MOVED_EVENT", {
                eventId: event.id,
                delta: 1,
              })
              break
            }
            case "delete": {
              globalState.send("DELETED_EVENT", {
                eventId: event.id,
              })
              break
            }
          }
        }}
      >
        <SelectOptionHeader>{event.name}</SelectOptionHeader>
        {event.index > 0 && <option value="move up">Move Up</option>}
        {event.index < global.data.events.size - 1 && (
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
