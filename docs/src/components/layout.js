/** @jsx jsx */
import { useState, useRef } from "react";
import { Global } from "@emotion/core";
import {
  Styled,
  Box,
  Layout,
  Main,
  Container,
  jsx,
  useThemeUI,
} from "theme-ui";

import Footer from "./footer";
import Header from "./header";
import Sidenav from "./sidenav";

export default ({ children }) => {
  const {
    theme: { colors = {} },
  } = useThemeUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useRef(null);

  const bodyStyles = {
    body: {
      margin: 0,
      color: colors.text,
      backgroundColor: colors.background,
    },
  };

  return (
    <Styled.root>
      <Global styles={bodyStyles} />
      <Box>
        <Header nav={nav} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <main>
          <Container py={0} px={3}>
            <div
              sx={{
                display: [null, "flex"],
                mx: -3,
                width: "100%",
                mt: [5, 0],
              }}
            >
              <Sidenav
                ref={nav}
                open={menuOpen}
                sx={{ display: [null, "block"] }}
                onFocus={() => setMenuOpen(true)}
                onBlur={() => setMenuOpen(false)}
                onClick={() => setMenuOpen(false)}
              />
              <div
                sx={{
                  px: [3, 0],
                  width: "100%",
                  overflow: "hidden",
                  mb: 2,
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
  );
};
