import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Flex } from "theme-ui"
import { Lists } from "./Lists"
import { Inspector } from "./Inspector"
import { Simulation } from "./Simulation"

export const Editor: React.FC<{}> = () => {
  return (
    <Flex sx={{ flexWrap: "wrap" }}>
      <Lists />
      <Inspector />
      <Simulation />
    </Flex>
  )
}
