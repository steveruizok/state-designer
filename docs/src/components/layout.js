/** @jsx jsx */
import { useState, useRef } from "react"
import { Global } from "@emotion/core"
import { Styled, Box, Container, jsx, useThemeUI } from "theme-ui"
import { motion } from "framer-motion"

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
                display: "flex",
                mt: [7, 0],
              }}
            >
              <Sidenav
                ref={nav}
                open={menuOpen}
                sx={{ display: [null, "block"] }}
                onClick={() => setMenuOpen(!menuOpen)}
              />
              <motion.div
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                sx={{
                  pl: [3, 0],
                  pr: [3, 4],
                  width: "100%",
                  overflow: "hidden",
                  mb: 2,
                  pt: [5, 5],
                }}
              >
                {children}
                <Footer />
              </motion.div>
            </div>
          </Container>
        </main>
      </Box>
    </Styled.root>
  )
}
