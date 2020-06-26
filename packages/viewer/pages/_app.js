import Prism from "prismjs"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "./styles.css"
import { Flex, ThemeProvider } from "theme-ui"
import { Global } from "@emotion/core"
import theme from "../components/theme"

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={(theme) => ({
          body: {
            fontFamily: theme.fonts.body,
            lineHeight: theme.lineHeights.body,
            fontWeight: theme.fontWeights.body,
            color: theme.colors.text,
            backgroundColor: theme.colors.background,
            margin: 0,
            minHeight: "100vh",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            "*": {
              boxSizing: "border-box",
            },
          },
        })}
      />
      <main>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  )
}

export default MyApp
