import React from "react"
import { createStateDesigner, useStateDesigner } from "state-designer"
import { SendInput } from "./components/SendInput"
import { SendButton } from "./components/SendButton"
import { Card } from "./components/Card"
import { Visualizer } from "./components/Visualizer"
import {
  Input,
  Flex,
  Text,
  Box,
  Button,
  IconButton
} from "@theme-ui/components"

export interface Props {}

export const Template: React.FC<Props> = ({ children }) => {
  const designer = createStateDesigner({})

  const [data, send, { can, isIn }] = useStateDesigner(designer)

  return (
    <Box mb={5}>
      <Visualizer title="Template" designer={designer} />
      <Card p={3}></Card>
    </Box>
  )
}
