import Head from "next/head"
import { Chart } from "../components/Chart"
import App, { Container } from "next/app"
import { ThemeProvider } from "theme-ui"
import { Global } from "@emotion/core"
import theme from "../components/theme"

export default class extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}

    if (Component?.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  render() {
    const { Component = Chart, pageProps } = this.props

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
          <main>{Component && <Component {...pageProps} />}</main>
        </ThemeProvider>
      </div>
    )
  }
}
