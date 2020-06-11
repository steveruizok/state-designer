// @refresh reset
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState, { State } from "./state"
import { Column, CreateRow, InputRow, SelectRow, ListRow } from "./shared"
import { Handler } from "./Handler"
import { Styled, Heading, Grid } from "theme-ui"
import { StateNode } from "./StateNode"

export const StatesList: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)

  return (
    <Column>
      <Heading>States</Heading>
      <StateNode node={global.values.states[0]} />
    </Column>
  )
}
