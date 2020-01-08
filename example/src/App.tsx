import React from "react"
import { Box } from "rebass"
import ValidInput from "./Examples/ValidInput"
import RadioButtons from "./Examples/RadioButtons"
import Counter from "./Examples/Counter"

export interface Props {}

const App: React.FC<Props> = ({ children }) => {
  return (
    <Box p={3}>
      <ValidInput />
      <RadioButtons value={"red"} options={["red", "green", "blue"]} />
      <Counter />
    </Box>
  )
}

export default App
