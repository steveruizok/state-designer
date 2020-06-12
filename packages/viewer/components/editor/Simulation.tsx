import * as React from "react"
import { useStateDesigner, StateGraph } from "@state-designer/react"
import { Button, Grid } from "theme-ui"
import global from "./state"
import { Column } from "./shared"

export const Simulation: React.FC<{}> = () => {
  const { values } = useStateDesigner(global)
  const state = useStateDesigner(values.simulation, [values.simulation])

  return (
    <Column bg={"simulation"}>
      <StateGraph state={state} />
      <Grid sx={{ height: "fit-content", flexDirection: "column", py: 4 }}>
        {values.events.map((event) => (
          <Button
            key={event.id}
            disabled={!state.can(event.name)}
            onClick={() => state.send(event.name)}
          >
            {event.name}
          </Button>
        ))}
      </Grid>
    </Column>
  )
}
