// @refresh reset
/** @jsx jsx */
import * as React from "react"
import { last } from "lodash"
import { useStateDesigner } from "@state-designer/react"
import { jsx, Flex, IconButton } from "theme-ui"
import { ChevronsLeft, ChevronsRight } from "react-feather"
import { motion, useMotionValue, useTransform } from "framer-motion"

const collapsedWidth = 44

export const ResizePanelRight: React.FC<{
  title?: string
  resizeDirection?: "left" | "right"
  minWidth?: number
  width?: number
  maxWidth?: number
}> = ({
  title = "Title",
  width = 400,
  minWidth = 320,
  maxWidth = 600,
  resizeDirection = "left",
  children,
}) => {
  const initialX = -3
  const dragX = useMotionValue(initialX)
  const titleOpacity = useTransform(dragX, [minWidth - 44, minWidth], [0, 1])
  const bodyOpacity = useTransform(dragX, [collapsedWidth, minWidth], [0, 1])

  const state = useStateDesigner({
    data: {
      width: initialX,
    },
    initial: "expanded",
    states: {
      expanded: {
        initial: "default",
        states: {
          default: {
            on: {
              RESIZE_STARTED: {
                to: "resized",
              },
            },
          },
          resized: {
            on: {
              RESIZE_ENDED: {
                if: "dragIndicatesCollapse",
                to: "collapsed",
              },
              RESET: { to: "default" },
            },
          },
        },
        on: {
          TOGGLED_COLLAPSE: { to: "collapsed" },
        },
      },
      collapsed: {
        on: {
          RESET: { to: "expanded" },
          RESIZE_ENDED: { if: "dragIndicatesExpand", to: "expanded" },
          TOGGLED_COLLAPSE: { to: "expanded" },
        },
      },
    },
    on: {
      RESIZED: "setWidth",
    },
    conditions: {
      dragIndicatesCollapse(_, { width }) {
        return width < minWidth - 44
      },
      dragIndicatesExpand(_, { width }) {
        return width > collapsedWidth + 44
      },
    },
    actions: {
      setWidth(data, { width }) {
        data.width = width
      },
    },
  })

  const activeNames = state.active.map((path) => last(path.split(".")))

  return (
    <motion.div
      style={{ width: dragX }}
      sx={{
        position: "relative",
        overflowX: "hidden",
        overflowY: "scroll",
      }}
    >
      <motion.div
        style={{ x: dragX }}
        sx={{
          width: 3,
          height: "100%",
          position: "absolute",
          left: "-3px",
          borderRight: "1px solid",
          borderColor: "rgba(79, 76, 89, 1.000)",
          cursor: "ew-resize",
          zIndex: 999,
          "&:hover": {
            borderColor: "rgba(89, 86, 99, 1.000)",
          },
        }}
        drag="x"
        dragMomentum={false}
        dragConstraints={state.whenIn({
          collapsed: { left: collapsedWidth, right: collapsedWidth },
          expanded: { left: minWidth, right: maxWidth },
        })}
        variants={{
          default: { x: 3 },
          collapsed: { x: collapsedWidth },
        }}
        animate={activeNames}
        onDoubleClick={() => state.send("RESET")}
        onDragStart={() => state.send("RESIZE_STARTED")}
        onDragEnd={() =>
          state.send("RESIZE_ENDED", {
            width: dragX.get(),
          })
        }
        onAnimationComplete={() =>
          state.send("RESIZE_ENDED", { width: dragX.get() })
        }
      />
      <Flex
        sx={{
          position: "sticky",
          top: 0,
          p: 2,
          height: 40,
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 888,
          borderBottom: "1px solid",
          borderColor: "bright",
          bg: "flat",
          "&:hover > button": {
            visibility: "visible",
          },
        }}
      >
        <motion.div style={{ opacity: titleOpacity, minWidth }}>
          {title}
        </motion.div>
        <IconButton
          sx={{
            position: "absolute",
            right: 2,
            cursor: "pointer",
            height: 28,
            width: 28,
            visibility: "hidden",
          }}
          onClick={() => state.send("TOGGLED_COLLAPSE")}
        >
          {state.whenIn({
            collapsed:
              resizeDirection === "left" ? <ChevronsRight /> : <ChevronsLeft />,
            default:
              resizeDirection === "left" ? <ChevronsLeft /> : <ChevronsRight />,
          })}
        </IconButton>
      </Flex>
      <motion.div
        style={{
          minWidth,
          opacity: bodyOpacity,
          pointerEvents: state.isIn("collapsed") ? "none" : "all",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
