// @refresh reset
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState from "./state"
import { StateNode } from "./StateNode"
import { ResizePanel } from "./panel/ResizePanel"
import { Grid } from "theme-ui"

export const Inspector: React.FC<{}> = (props) => {
  const global = useStateDesigner(globalState)
  const { editingState } = global.values

  return (
    <ResizePanel title="State" width={540}>
      <Grid gap={2} p={2}>
        {editingState && (
          <StateNode key={editingState.id} node={editingState} />
        )}
      </Grid>
    </ResizePanel>
  )
}
