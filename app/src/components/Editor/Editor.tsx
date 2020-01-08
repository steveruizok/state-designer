import React from "react"
import { Box, Heading } from "rebass"
import { useStateDesigner } from "state-designer"
import { Main } from "../../machines/main"

export interface Props {}

export const Editor: React.FC<Props> = ({ children }) => {
  const { data, send } = useStateDesigner(Main)

  return (
    <Box
      p={2}
      backgroundColor="background"
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 375,
        height: "100vh",
        zIndex: 1000,
        borderLeft: "1px solid #000",
        display: "grid",
        gridGap: 1,
      }}
    >
      <Heading>Editor</Heading>
    </Box>
  )
}
