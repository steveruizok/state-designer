import * as React from "react"
import { Box } from "theme-ui"
import { ContentPanel } from "./content-panel/ContentPanel"
import { CollectionsPanel } from "./CollectionsPanel"
import { StatePanel } from "./state-panel/StatePanel"
import { Simulation } from "./Simulation"
import { DragDropContext } from "react-beautiful-dnd"
import globalState from "./state"

export const Editor: React.FC<{}> = () => {
  return (
    <Box
      sx={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "auto auto auto 1fr",
        gridTemplateRows: ["auto", "100vh"],
      }}
    >
      <DragDropContext
        onDragEnd={(e) => {
          const { source, destination } = e
          if (!destination) return
          const id = e.draggableId
          const delta = destination.index - source.index

          if (e.source.droppableId.endsWith("children")) {
            globalState.send("MOVED_STATE", {
              stateId: id,
              delta,
            })
            return
          }

          switch (e.source.droppableId) {
            case "event-list": {
              globalState.send("MOVED_EVENT", {
                eventId: id,
                delta,
              })
              break
            }
            case "actions-list": {
              globalState.send("MOVED_ACTION", {
                id,
                delta,
              })
              break
            }
            case "conditions-list": {
              globalState.send("MOVED_CONDITION", {
                id,
                delta,
              })
              break
            }
            case "values-list": {
              globalState.send("MOVED_VALUE", {
                id,
                delta,
              })
              break
            }
            default: {
              break
            }
          }
        }}
      >
        <ContentPanel />
        <StatePanel />
        <CollectionsPanel />
        <Simulation />
      </DragDropContext>
    </Box>
  )
}
