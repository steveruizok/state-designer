import React from "react"
import { Box, Heading, Button } from "rebass"
import { Label, Input } from "@rebass/forms"
import { StateDesigner, useStateDesigner } from "state-designer"
import { namedFunctionListConfig } from "./machines/namedFunctionList"
import { NamedFunctionList } from "./NamedFunctionList"

export interface Props {}

const Designer: React.FC<Props> = ({ children }) => {
  const namedFunctionListSD = new StateDesigner(namedFunctionListConfig)

  return (
    <Box p={2}>
      <NamedFunctionList state={namedFunctionListSD} />
    </Box>
  )
}

export default Designer
