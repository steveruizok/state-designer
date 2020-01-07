import React from "react"
import sortBy from "lodash/sortBy"
import { Box } from "rebass"
import { Collections } from "../machines/Collections"
import { useStateDesigner } from "state-designer"
import { DragList } from "./DragList"
import { State } from "./State"
import { CodeEditor } from "./CodeEditor"
import { Title } from "./Title"

export interface Props {}

export const States: React.FC<Props> = ({ children }) => {
  const { data, send } = useStateDesigner(Collections.states)

  return (
    <Box sx={{ position: "relative", minWidth: 500 }}>
      <DragList
        id="states"
        onDragEnd={result =>
          result.destination &&
          send("MOVE", {
            id: result.draggableId,
            target: result.destination.index - 1
          })
        }
      >
        {sortBy(Array.from(data.values()), "index").map(state => {
          return <State key={state.id} index={state.index} state={state} />
        })}
      </DragList>
    </Box>
  )
}
