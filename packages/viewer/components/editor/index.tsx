import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Grid } from "theme-ui"
import { EventsList } from "./EventsList"
import { StatesList } from "./StatesList"
import global from "./state"

export const Editor: React.FC<{}> = () => {
  return (
    <Grid columns={"420px"} p={4} gap={4}>
      <EventsList />
      <StatesList />
    </Grid>
  )
}
