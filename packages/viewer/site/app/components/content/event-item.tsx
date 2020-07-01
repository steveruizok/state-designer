// @jsx jsx
import * as React from "react"
import * as Utils from "../../../static/scope-utils"
import { jsx, Button, useThemeUI } from "theme-ui"
import { motion, useAnimation } from "framer-motion"
import { PlayCircle, Square } from "react-feather"
import ContentRowItem from "./content-row-item"
import { Project } from "../../states"
import { Highlights } from "../../states/highlights"

const EventItem: React.FC<{
  eventName: string
  highlight: boolean
  highlightCount: number
  disabled: boolean
  payload: any
}> = ({ eventName, disabled, highlight, highlightCount, payload }) => {
  const { theme } = useThemeUI()
  const animation = useAnimation()

  React.useEffect(() => {
    if (highlight) {
      animation.set({ color: theme.colors.accent })
      animation.start({
        color: theme.colors.text,
        transition: {
          type: "tween",
          duration: 0.5,
          ease: "easeIn",
        },
      })
    }
  }, [highlight, highlightCount])

  return (
    <ContentRowItem
      onMouseOver={(e) =>
        Highlights.send("HIGHLIT_EVENT", {
          eventName,
          shiftKey: e.shiftKey,
        })
      }
      onMouseLeave={() => Highlights.send("CLEARED_HIGHLIGHT")}
    >
      <Button
        variant="contentEvent"
        onClick={() => {
          try {
            const value = Function(
              "Utils",
              "Static",
              `return ${payload}`
            )(Utils, Project.data.statics)
            Project.data.captive.send(eventName, value)
          } catch (e) {
            console.warn("Error in event payload:", eventName)
          }
        }}
        disabled={disabled}
      >
        <Square strokeWidth={3} size={8} sx={{ ml: 1, mr: 2, mb: "1px" }} />
        <motion.div
          sx={{
            flexGrow: 1,
            textAlign: "left",
            overflow: "hidden",
          }}
          initial={false}
          animate={animation}
        >
          {eventName}
        </motion.div>
        <PlayCircle
          data-hidey="true"
          size={12}
          strokeWidth={2}
          sx={{ color: disabled ? "inactive" : "accent" }}
        />
      </Button>
    </ContentRowItem>
  )
}

export default EventItem
