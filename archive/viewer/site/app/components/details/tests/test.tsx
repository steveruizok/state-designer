import * as React from "react"
import { Box, Styled, Spinner, Text } from "theme-ui"
import { XCircle, CheckCircle } from "react-feather"

const colors = {
  running: "text",
  pass: "Green",
  fail: "accent",
}

const Test: React.FC<{
  name: string
  message: string
  state: "running" | "pass" | "fail"
}> = ({ name, message, state }) => {
  const icons = {
    running: <Spinner sx={{ color: "text" }} size={16} />,
    pass: <CheckCircle size={16} />,
    fail: <XCircle size={16} />,
  }

  return (
    <Styled.li>
      <Box sx={{ color: colors[state] }}>{icons[state]}</Box>
      <Text sx={{ gridColumn: 2, color: colors[state] }}>{name}</Text>
      {message && <Styled.pre>{message}</Styled.pre>}
    </Styled.li>
  )
}

export default Test
