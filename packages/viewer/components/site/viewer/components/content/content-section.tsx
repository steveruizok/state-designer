// @jsx jsx
import * as React from "react"
import { Flex, jsx, Heading, IconButton } from "theme-ui"
import { ChevronDown, ChevronUp } from "react-feather"
import { motion } from "framer-motion"
import { Highlights } from "../../states/highlights"

const ContentSection: React.FC<{ title: string; isBottomUp?: boolean }> = ({
  title,
  isBottomUp = false,
  children,
}) => {
  const [isCollapsed, setCollapsed] = React.useState(false)

  return (
    <motion.div
      sx={{
        borderTop: "outline",
        borderColor: "border",
        overflow: "hidden",
        pb: 2,
        "&:nth-of-type(1)": {
          borderTop: "none",
        },
      }}
      variants={{ open: { height: "auto" }, collapsed: { height: 43 } }}
      initial="open"
      animate={isCollapsed ? "collapsed" : "open"}
      transition={{
        type: "spring",
        stiffness: 800,
        damping: 800,
        restDelta: 1,
        restSpeed: 1,
      }}
    >
      <Flex
        onMouseEnter={() => Highlights.send("CLEARED_HIGHLIGHT")}
        variant="contentHeading"
        data-iscollapsed={isCollapsed ? "true" : "false"}
      >
        <Heading variant="contentHeading">{title}</Heading>
        <IconButton onClick={() => setCollapsed((isCollapsed) => !isCollapsed)}>
          {isBottomUp ? (
            isCollapsed ? (
              <ChevronUp />
            ) : (
              <ChevronDown />
            )
          ) : isCollapsed ? (
            <ChevronDown />
          ) : (
            <ChevronUp />
          )}
        </IconButton>
      </Flex>
      {children}
    </motion.div>
  )
}

export default ContentSection
