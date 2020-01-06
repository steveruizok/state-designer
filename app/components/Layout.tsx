import * as React from "react"
import { ThemeProvider } from "emotion-theming"
import theme from "./theme"
import { Box } from "rebass"
import Head from "next/head"
import "./styles.css"

type Props = {
  title?: string
}

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = "This is the default title"
}) => (
  <ThemeProvider theme={theme}>
    <Box p={3}>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header></header>
      {children}
      <footer></footer>
    </Box>
  </ThemeProvider>
)

export default Layout
