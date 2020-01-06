import React from "react"
import { useStateDesigner } from "state-designer"
import { Box, Button } from "rebass"

export interface Props {}

const App: React.FC<Props> = ({ children }) => {
  const { data, send } = useStateDesigner({
    data: {
      count: 0
    },
    on: {
      INCREMENT: {
        do: "increment",
        unless: "atMax"
      }
    },
    actions: {
      increment: data => data.count++
    },
    conditions: {
      atMax: data => data.count === 10,
      belowMax: data => data.count < 10,
      aboveMin: data => data.count > 0
    },
    results: {},
    states: {}
  })

  return (
    <Box p={3}>
      <h2>Count: {data.count}</h2>
      <button onClick={() => send("INCREMENT")}>Increment</button>
      <button onClick={() => send("DECREMENT")}>Decrement</button>
    </Box>
  )
}

export default App
