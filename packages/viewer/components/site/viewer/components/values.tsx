import * as React from "react"
import { Flex, Heading, Styled, Box } from "theme-ui"
import { ui } from "../states/ui"
import { useStateDesigner } from "@state-designer/react"

const Values: React.FC = (props) => {
  const local = useStateDesigner(ui)
  const captive = useStateDesigner(local.data.captive, [local.data.captive])

  return (
    <Box
      sx={{
        overflowX: "hidden",
        overflowY: "scroll",
        borderLeft: "outline",
        borderColor: "border",
        position: "relative",
      }}
    >
      <Flex
        variant="contentHeading"
        sx={{ position: "sticky", top: 0, left: 0 }}
      >
        <Heading variant="contentHeading">Values</Heading>
      </Flex>
      <Box sx={{ p: 2 }}>
        <Styled.pre>
          <Styled.code>{JSON.stringify(captive.values, null, 2)}</Styled.code>
        </Styled.pre>
      </Box>
    </Box>
  )
}
export default Values
