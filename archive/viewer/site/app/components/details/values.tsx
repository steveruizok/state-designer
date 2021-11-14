import * as React from "react"
import { Flex, Heading, Styled, Box } from "theme-ui"

const Values: React.FC<{ values: any }> = ({ values, children }) => {
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
          <Styled.code>{JSON.stringify(values, null, 2)}</Styled.code>
        </Styled.pre>
      </Box>
      {children}
    </Box>
  )
}
export default Values
