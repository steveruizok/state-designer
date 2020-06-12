// @refresh reset
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState, { State } from "./state"
import { Column } from "./shared"
import { StateNode } from "./StateNode"
import { Styled, Box, Button, Radio, Label } from "theme-ui"

export const Inspector: React.FC<{}> = (props) => {
  const global = useStateDesigner(globalState)
  const { editingState } = global.values

  return (
    <Column bg={"panel"}>
      {editingState && <StateNode key={editingState.id} node={editingState} />}
    </Column>
  )
}
