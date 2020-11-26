import Router from "next/router"
import withGA from "next-ga"
import "./styles.css"
import { ThemeProvider } from "theme-ui"
import { Global } from "@emotion/core"
import theme from "../theme"
import { useUser } from "../auth/useUser"

function MyApp({ Component, pageProps }) {
  const { user, logout } = useUser()
  console.log(user)
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
        <Component {...pageProps} user={user} logout={logout} />
      </main>
    </ThemeProvider>
  )
}

export default withGA("UA-159357149-1", Router)(MyApp)
