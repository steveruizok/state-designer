// @jsx jsx
import * as React from "react"
import { Flex, jsx, Heading, IconButton } from "theme-ui"
import { ChevronDown, ChevronUp, Zap, ZapOff } from "react-feather"
import { motion } from "framer-motion"
import { Highlights } from "../../states/highlights"

const ContentSection: React.FC<{
  title: string
  zap: boolean | undefined
  onZapChange?: (zap: boolean) => void
  isBottomUp?: boolean
}> = ({ title, isBottomUp = false, zap, onZapChange, children }) => {
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
        onMouseEnter={() => Highlights.send("CLEARED_HIGHLIGHTS")}
        variant="contentHeading"
        data-iscollapsed={isCollapsed ? "true" : "false"}
      >
        <Heading variant="contentHeading" sx={{ flexGrow: 2 }}>
          {title}
        </Heading>
        {zap === undefined || (
          <IconButton
            title={zap ? "Turn off Updates" : "Turn on Updates"}
            onClick={() => onZapChange && onZapChange(!zap)}
          >
            {zap ? <Zap /> : <ZapOff />}
          </IconButton>
        )}
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
