import * as React from "react"
import { Flex, Heading, Styled, Box } from "theme-ui"

const Data: React.FC<{ data: any }> = ({ data }) => {
  return (
    <Box
      sx={{
        overflowX: "hidden",
        overflowY: "scroll",
      }}
    >
      <Flex
        variant="contentHeading"
        sx={{ position: "sticky", top: 0, left: 0 }}
      >
        <Heading variant="contentHeading">Data</Heading>
      </Flex>
      <Box sx={{ p: 2 }}>
        <Styled.pre>
          <Styled.code>{JSON.stringify(data, null, 2)}</Styled.code>
        </Styled.pre>
      </Box>
    </Box>
  )
}
export default Data
