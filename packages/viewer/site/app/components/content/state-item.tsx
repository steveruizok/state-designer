// @jsx jsx
import { range } from "lodash"
import * as React from "react"
import { jsx, Button, useThemeUI, IconButton, Box } from "theme-ui"
import { motion, useAnimation } from "framer-motion"
import { MinusCircle, Crosshair, Maximize, Circle, Disc } from "react-feather"
import ContentRowItem from "./content-row-item"
import { Project, UI } from "../../states"
import { Highlights } from "../../states/highlights"
import { S } from "@state-designer/react"

const EventItem: React.FC<{
  node: S.State<any, any>
  highlight: boolean
}> = ({ node, highlight }) => {
  const { theme } = useThemeUI()
  const animation = useAnimation()

  React.useEffect(() => {
    if (highlight) {
      animation.set({ color: theme.colors.accent })
      animation.start({
        color: theme.colors.text,
        transition: {
          type: "tween",
          duration: 0.35,
          ease: "easeIn",
        },
      })
    }
  }, [highlight])

  return (
    <ContentRowItem>
      <Button
        variant="contentRow"
        title={`Zoom to ${node.name}`}
        onClick={() => Project.send("SELECTED_NODE", { id: node.path })}
        onMouseEnter={(e) =>
          Highlights.send("HIGHLIT_STATE", {
            stateName: node.name,
            shiftKey: e.shiftKey,
          })
        }
        onMouseLeave={() => Highlights.send("CLEARED_HIGHLIGHT")}
      >
        {range(node.depth).map((i) => (
          <Circle
            key={i}
            size="4"
            fill="text"
            sx={{ ml: 1, mr: 2, opacity: node.active ? 1 : 0.5 }}
          />
        ))}
        {node.isInitial ? (
          <Disc
            size="12"
            strokeWidth={3}
            sx={{ mr: 2, opacity: node.active ? 1 : 0.5 }}
          />
        ) : node.parentType === "branch" ? (
          <Circle
            size="12"
            strokeWidth={3}
            sx={{ mr: 2, opacity: node.active ? 1 : 0.5 }}
          />
        ) : (
          <MinusCircle
            size="12"
            strokeWidth={3}
            opacity={node.active ? 1 : 0.5}
            sx={{
              mr: 2,
              transform: "rotate(90deg)",
              opacity: node.active ? 1 : 0.5,
            }}
          />
        )}
        <motion.div
          animate={animation}
          sx={{ flexGrow: 1, textAlign: "left", overflow: "hidden" }}
        >
          {node.name}
        </motion.div>
      </Button>
      <IconButton
        data-hidey="true"
        title={`Zoom to State`}
        onClick={() => UI.send("ZOOMED_TO_NODE", { path: node.path })}
      >
        <Maximize />
      </IconButton>
      <IconButton
        data-hidey="true"
        title={`Force Transition to State`}
        onClick={(e) => {
          let target = node.name

          if (e.shiftKey) {
            target += ".previous"
          } else if (e.altKey) {
            target += ".restore"
          }

          Project.data.captive.forceTransition(target)
        }}
      >
        <Crosshair size={12} />
      </IconButton>
    </ContentRowItem>
  )
}

export default EventItem
