/** @jsx jsx */
import React from "react"
import { jsx } from "theme-ui"
import { Sidenav } from "@theme-ui/sidenav"

import { useScrollPosition } from "../hooks/useScrollPosition"
import SidebarLink from "./sidebar-link"
import Content from "../../content/nav/sidebar.mdx"

export default React.forwardRef((props, ref) => {
  const scrollProps = useScrollPosition()

  return (
    <div
      {...scrollProps}
      sx={{
        position: ["absolute", "sticky"],
        width: [props.open ? "100%" : "0%", "fit-content"],
        top: 0,
        left: 0,
        pl: [0, 5],
        pr: [0, 6],
        mr: 3,
        height: "100vh",
        overflowY: "scroll",
        overflowX: "hidden",
      }}
    >
      <Sidenav
        {...props}
        components={{
          a: SidebarLink,
        }}
        ref={ref}
        sx={{
          width: ["100%", "inherit"],
          flex: "none",
          pt: 5,
          pb: 9,
          px: [3, 2],
          mx: 0,
          mt: [57, 0],
          transition: "none",
          "& ul ul a": {
            pl: 0,
          },
          "& ul ul a::before": {
            content: "'- '",
            color: "text",
            pl: 2,
          },
          "& li": {
            my: 0,
            pl: 0,
            ml: 0,
          },
        }}
      >
        <Content />
      </Sidenav>
    </div>
  )
})
