import * as React from "react"
import { Flex, Heading, Styled, Box } from "theme-ui"

const Log: React.FC<{ log: string[] }> = ({ log }) => {
  const rContainer = React.useRef<HTMLDivElement>()

  return (
    <Box
      ref={rContainer}
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
        <Heading variant="contentHeading">Log</Heading>
      </Flex>
      <Box sx={{ p: 2, fontSize: 1, fontFamily: "monospace" }}>
        <Styled.ul>
          {log.map((entry, i) => (
            <Styled.li key={i}>{entry}</Styled.li>
          ))}
        </Styled.ul>
      </Box>
    </Box>
  )
}
export default Log
