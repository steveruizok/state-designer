// @jsx jsx
import * as React from "react"
import { Project } from "../states"
import { Copy } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import ColorModeToggle from "./color-mode-toggle"
import { jsx, Flex, IconButton, Button } from "theme-ui"

const Controls: React.FC = ({}) => {
  const local = useStateDesigner(Project)

  return (
    <Flex
      sx={{
        gridArea: "controls",
        alignItems: "center",
        justifyContent: "flex-end",
        borderBottom: "outline",
        borderColor: "border",
      }}
    >
      {local.data.isOwner ? (
        <IconButton
          title="Copy This Project"
          onClick={() => local.send("FORKED_PROJECT")}
        >
          <Copy />
        </IconButton>
      ) : (
        <Button
          title="Copy This Project"
          onClick={() => local.send("FORKED_PROJECT")}
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            color: "accent",
          }}
        >
          Copy this Project <Copy size={14} strokeWidth={3} sx={{ ml: 2 }} />
        </Button>
      )}
      <ColorModeToggle />
    </Flex>
  )
}

export default Controls
