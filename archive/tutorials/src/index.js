import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider, ColorModeProvider, CSSReset } from "@chakra-ui/core"

import theme from "./theme"
import App from "./App"

const rootElement = document.getElementById("root")
ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <BrowserRouter>
          <CSSReset />
          <App />
        </BrowserRouter>
      </ColorModeProvider>
    </ThemeProvider>
  </React.StrictMode>,
  rootElement
)
