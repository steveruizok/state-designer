import * as React from "react"
import { useStateDesigner, StateGraph } from "@state-designer/react"
import { Divider, Button, Grid, Styled } from "theme-ui"
import global from "./state"
import { Column } from "./shared"

export const Simulation: React.FC<{}> = () => {
  const { values } = useStateDesigner(global)
  const state = useStateDesigner(values.simulation, [values.simulation])

  return (
    <Column bg={"simulation"}>
      <StateGraph state={state} />
      <Grid
        sx={{
          height: "fit-content",
          width: "fit-content",
          flexDirection: "column",
          py: 4,
        }}
      >
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
      Data:
      <Styled.pre>
        <Styled.code>{JSON.stringify(state.data, null, 2)}</Styled.code>
      </Styled.pre>
      <Divider />
      Design
      <Styled.pre>
        <Styled.code>
          {JSON.stringify(
            state.getDesign(),
            (k, v) =>
              typeof v === "function"
                ? v
                    .toString()
                    .replace("function anonymous", "function " + k)
                    .replace("data,payload,result\n)", "data, payload, result)")
                : v,
            2
          )}
        </Styled.code>
      </Styled.pre>
    </Column>
  )
}
