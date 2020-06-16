// @refresh reset
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState from "../state"
import { StateEditor } from "./StateEditor"
import { ResizePanel } from "../panel/ResizePanel"
import { Grid } from "theme-ui"

export const StatePanel: React.FC<{}> = (props) => {
  const global = useStateDesigner(globalState)
  const { editingState } = global.values

  const rPanel = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const panel = rPanel.current
    panel.scrollTo({ top: 0 })
  }, [editingState])

  return (
    <ResizePanel ref={rPanel} title="State" width={540}>
      {editingState && (
        <StateEditor key={editingState.id} node={editingState} />
      )}
    </ResizePanel>
  )
}
