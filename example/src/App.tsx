import React from "react"
import { Heading, Box } from "@theme-ui/components"
import ValidInput from "./Examples/ValidInput"
import RadioButtons from "./Examples/RadioButtons"
import Counter from "./Examples/Counter"
import { TransitionOnEnter } from "./Examples/TransitionOnEnter"
import { OnEnter } from "./Examples/OnEnter"
import { ThemeProvider, Styled } from "theme-ui"
import theme from "./theme"

export interface Props {}

const App: React.FC<Props> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <Box p={3} sx={{ maxWidth: 500 }}>
        <Styled.h1>State Designer</Styled.h1>
        {/* <ValidInput />
      <RadioButtons value={"red"} options={["red", "green", "blue"]} />
      <Counter /> */}
        {/* <OnEnter />4 */}
        <TransitionOnEnter />
        <hr />
        <Counter />
        <hr />
        <ValidInput />
      </Box>
    </ThemeProvider>
  )
}

export default App
