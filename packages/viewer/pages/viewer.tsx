import Head from "next/head"
import Viewer from "../components/viewer"
import { ThemeProvider } from "theme-ui"
import { Global } from "@emotion/core"
import theme from "../components/theme"

const Index = () => {
  return (
    <div>
      <Head>
        <title>State Designer Viewer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
              display: "flex",
              flexDirection: "column",
              "*": {
                boxSizing: "border-box",
              },
            },
          })}
        />
        <main>
          <Viewer project={"toggle"} />
        </main>
      </ThemeProvider>
    </div>
  )
}

export default Index
