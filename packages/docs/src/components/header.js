/** @jsx jsx */
import { jsx, Container, Flex } from "theme-ui"
import { MDXProvider } from "@mdx-js/react"

import MenuButton from "./menu-button"
import HeaderLink from "./header-link"
import Content from "../../content/nav/header.mdx"

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
          borderColor: "text",
          borderBottomStyle: "solid",
          borderBottomWidth: "1px",
          backgroundColor: "#FFFFFF",
        }}
      >
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
          <MDXProvider components={components}>
            <Content />
          </MDXProvider>
        </Flex>
      </Flex>
    </Container>
  )
}
