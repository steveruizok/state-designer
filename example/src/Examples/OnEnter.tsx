import React from "react"
import { Card } from "./components/Card"
import { Visualizer } from "./components/Visualizer"
import { Box, Button } from "@theme-ui/components"
import { createStateDesigner, useStateDesigner } from "state-designer"

export interface Props {}

export const OnEnter: React.FC<Props> = ({ children }) => {
  const designer = createStateDesigner({
    data: {
      count: 0
    },
    initial: "inactive",
    on: {
      TOGGLE: {
        do: data => data.count++
      }
    },
    actions: {
      increment: data => data.count++,
      decrement: data => data.count--
    },
    conditions: {
      atMax: data => data.count === 10,
      atMin: data => data.count === 0
    },
    states: {
      active: {
        onEnter: "increment",
        on: {
          TOGGLE: { to: "inactive" }
        }
      },
      inactive: {
        onEnter: "decrement",
        on: {
          TOGGLE: { to: "active" }
        }
      }
    }
  })

  const [data, send, { can }] = useStateDesigner(designer)

  return (
    <Box mb={5}>
      <Visualizer title="Counter" designer={designer} />
      <Card p={3}>
        <Button onClick={() => send("TOGGLE")}>Toggle</Button>
      </Card>
    </Box>
  )
}
