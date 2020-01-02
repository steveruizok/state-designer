import React from "react"
import { Box, Text } from "rebass"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Code, Check, MoreHorizontal, X, Plus } from "react-feather"
import {
  useMotionValue,
  useTransform,
  AnimatePresence,
  motion,
  PanInfo
} from "framer-motion"

export interface Props {
  title?: string
  editing?: boolean
  dirty?: boolean
  drag?: boolean
  options?: string[]
  error?: string
  onDragStart?: (e: any, info: PanInfo) => void
  onDragEnd?: (e: any, info: PanInfo) => void
  onDrag?: (e: any, info: PanInfo) => void
  onSave?: () => void
  onCancel?: () => void
  onMoreSelect?: (value: string) => void
  onCreate?: () => void
}

export const Item: React.FC<Props> = ({
  title,
  editing = false,
  dirty = false,
  drag = false,
  error,
  options = [],
  onCreate,
  onSave,
  onCancel,
  onMoreSelect = v => {
    console.log(v)
  },
  children
}) => {
  const [hovered, setHovered] = React.useState(false)

  return (
    <Box
      m={1}
      mb={2}
      p={2}
      // onMouseEnter={e => {
      //   setHovered(true)
      // }}
      // onMouseLeave={e => {
      //   setHovered(false)
      // }}
    >
      <Box
        p={2}
        sx={{
          position: "relative",
          border: `1px solid #aaa`,
          borderRadius: 4,
          minHeight: 60
        }}
      >
        {/*Header*/}
        <ItemHeader title={title}>
          {onCreate && (
            <Box
              sx={{
                zIndex: 2,
                backgroundColor: "background"
              }}
              onClick={onCreate}
            >
              <Plus size={20} />
            </Box>
          )}
          {options.length > 0 && (
            <Box width={20} sx={{ position: "relative" }}>
              <MoreHorizontal size={20} />
              <select
                value={""}
                onChange={e => onMoreSelect(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  opacity: 0
                }}
              >
                <option value=""> </option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Box>
          )}
        </ItemHeader>
        {/*Dragging*/}
        {drag && (
          <Box
            p={2}
            sx={{
              position: "absolute",
              top: 10,
              left: -16,
              backgroundColor: "background"
            }}
          >
            <Code size={16} style={{ transform: "rotate(90deg)" }} />
          </Box>
        )}
        {/*Body*/}
        <Box
          p={2}
          py={3}
          sx={{
            display: "grid",
            gridAutoFlow: "row",
            gap: 2,
            overflow: "hidden"
          }}
        >
          {children}
        </Box>
        {/*Footer*/}
        <ItemFooter>
          <>
            {editing && <X size={20} onClick={onCancel} />}
            {dirty && (
              <Check
                size={20}
                onClick={error ? undefined : onSave}
                opacity={error ? 0.5 : 1}
              />
            )}
          </>
        </ItemFooter>
      </Box>
    </Box>
  )
}

const ItemHeader: React.FC<{ title?: string }> = ({ title, children }) => {
  return (
    <Box
      p={2}
      sx={{
        display: "grid",
        width: "100%",
        gridTemplateColumns: "min-content 1fr",
        gridAutoColumns: "fit-content",
        gridAutoFlow: "column",
        alignItems: "center",
        lineHeight: 1,
        position: "absolute",
        left: 0,
        top: -20,
        height: 40,
        userSelect: "none"
      }}
    >
      <Text
        fontFamily="body"
        px={2}
        sx={{
          backgroundColor: "background",
          gridRow: 0,
          fontSize: 14,
          fontWeight: 600
        }}
      >
        {title}
      </Text>
      <Box />
      <Box
        px={2}
        sx={{
          display: "grid",
          gridAutoFlow: "column",
          alignItems: "center",
          gap: 2,
          backgroundColor: "background",
          gridRow: 0
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

const ItemFooter: React.FC<{}> = ({ children }) => {
  return (
    <Box
      p={2}
      sx={{
        position: "absolute",
        left: 0,
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr",
        gridAutoColumns: "fit-content",
        gridAutoFlow: "column",
        alignItems: "center",
        lineHeight: 1,
        bottom: -18,
        height: 36,
        userSelect: "none"
      }}
    >
      <Box />
      <Box
        px={2}
        sx={{
          display: "grid",
          alignItems: "center",
          gridAutoFlow: "column",
          columnGap: 2,
          backgroundColor: "background",
          gridRow: 0,
          fontSize: 14,
          fontWeight: 400
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

const ExpandingHorizontalList: React.FC<{}> = ({ children }) => {
  return (
    <AnimatePresence>
      {React.Children.map(children, (node, index) => (
        <motion.div
          positionTransition={{ duration: 0.18 }}
          style={{ overflow: "hidden" }}
          exit={{ width: 0, opacity: 0 }}
        >
          {node}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

const ExpandingVerticalList: React.FC<{}> = ({ children }) => {
  return (
    <AnimatePresence>
      {React.Children.map(children, (node, index) => (
        <motion.div
          positionTransition={{ duration: 0.18 }}
          style={{ overflow: "hidden" }}
          exit={{ height: 0, opacity: 0 }}
        >
          {node}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
