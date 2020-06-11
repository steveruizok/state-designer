import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Flex } from "theme-ui"
import { EventsList } from "./EventsList"
import { StatesList } from "./StatesList"
import { Simulation } from "./Simulation"

export const Editor: React.FC<{}> = () => {
  return (
    <Flex sx={{ flexWrap: "wrap" }}>
      <EventsList />
      <StatesList />
      <Simulation />
    </Flex>
  )
}
