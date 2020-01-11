import React from "react"
import { Box, Button, Heading } from "rebass"
import { useStateDesigner } from "state-designer"

export interface Props {}

export const OnEnter: React.FC<Props> = ({ children }) => {
  const [data, send] = useStateDesigner({
    data: {
      count: 0
    },
    initial: "inactive",
    states: {
      active: {
        onEnter: data => data.count++,
        on: {
          TOGGLE: { to: "inactive" }
        }
      },
      inactive: {
        onEnter: data => data.count--,
        on: {
          TOGGLE: { to: "active" }
        }
      }
    }
  })

  return (
    <Box>
      <Heading>Count: {data.count}</Heading>
      <Button onClick={() => send("TOGGLE")}>Toggle</Button>
    </Box>
  )
}
