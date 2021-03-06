/** @jsx jsx */
import { jsx, Box, Container, Flex } from "theme-ui"
import { Link } from "gatsby"
import { MDXProvider } from "@mdx-js/react"

import MenuButton from "./menu-button"
import HeaderLink from "./header-link"
import Content from "../../content/nav/header.mdx"
import L from "./lockup.svg"

const components = {
  a: HeaderLink,
}

export default ({ menuOpen, setMenuOpen, nav }) => {
  return (
    <Container
      sx={{
        mx: [0, "auto"],
        px: [0, 4],
        py: 0,
        position: ["fixed", "relative"],
        top: 0,
        left: 0,
        backgroundColor: "#FFFFFF",
        zIndex: "99999",
      }}
    >
      <Flex
        sx={{
          justifyContent: "space-between",
          ml: [3, 2],
          mr: [3, 0],
          pb: [2, 5],
          pt: [3, 5],
          height: "100%",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            bottom: "-1px",
            left: 0,
            width: "100%",
            borderBottomStyle: "solid",
            borderBottomWidth: "1px",
            borderColor: "text",
          }}
        />
        <Flex
          sx={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            m: 0,
            pb: 0,
            h1: {
              m: 0,
              fontSize: [3, 4],
              px: [2, 0],
              py: 2,
              lineHeight: 1,
              "& a": {
                fontSize: [2, 4],
                color: "text",
                px: [0, 0],
                mr: 0,
              },
            },
            a: {
              px: 3,
              mr: -3,
            },
            ul: {
              my: 0,
              ml: "auto",
              display: "flex",
              listStyleType: "none",
            },
            li: {
              my: 0,
            },
          }}
        >
          <MenuButton
            sx={{ mr: 2 }}
            onClick={(e) => {
              setMenuOpen(!menuOpen)
              if (!nav.current) return
              const navLink = nav.current.querySelector("a")
              if (navLink) navLink.focus()
            }}
          />
          <Link to="/" style={{ padding: 0, lineHeight: 0 }}>
            <img src={L} height={20} />
          </Link>
          <MDXProvider components={components}>
            <Content />
          </MDXProvider>
        </Flex>
      </Flex>
    </Container>
  )
}
