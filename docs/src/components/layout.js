/** @jsx jsx */
import { useState, useRef } from "react"
import { Global } from "@emotion/core"
import { Styled, Box, Container, jsx, useThemeUI } from "theme-ui"

import Footer from "./footer"
import Header from "./header"
import Sidenav from "./sidenav"

export default ({ children }) => {
  const {
    theme: { colors = {} },
  } = useThemeUI()
  const [menuOpen, setMenuOpen] = useState(false)
  const nav = useRef(null)

  const bodyStyles = {
    body: {
      margin: 0,
      color: colors.text,
      backgroundColor: colors.background,
    },
  }

  return (
    <Styled.root>
      <Global styles={bodyStyles} />
      <Box sx={{ maxWidth: 960, margin: "0 auto" }}>
        <Header nav={nav} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <main>
          <Container py={0}>
            <div
              sx={{
                display: [null, "flex"],
                mt: [5, 0],
              }}
            >
              <Sidenav
                ref={nav}
                open={menuOpen}
                sx={{ display: [null, "block"] }}
                onClick={() => setMenuOpen(!menuOpen)}
              />
              <div
                sx={{
                  pl: [3, 0],
                  pr: [3, 4],
                  width: "100%",
                  overflow: "hidden",
                  mb: 2,
                  pt: [5, 3],
                }}
              >
                {children}
                <Footer />
              </div>
            </div>
          </Container>
        </main>
      </Box>
    </Styled.root>
  )
}
