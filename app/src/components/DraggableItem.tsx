import React from "react"
import { Box, Flex } from "rebass"
import { Code } from "react-feather"
import { Item, Props } from "./Item"
import { Draggable } from "react-beautiful-dnd"

export type DraggableProps = {
  draggable: boolean
  draggableId: string
  draggableIndex: number
} & Props

export const DraggableItem: React.FC<DraggableProps> = ({
  draggable = false,
  draggableId,
  draggableIndex,
  ...rest
}) => {
  return (
    <div style={{ position: "relative" }}>
      <Draggable draggableId={draggableId} index={draggableIndex}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <Item {...rest} />
            <div
              style={{
                position: "absolute",
                display: "flex",
                background: "#fff",
                top: 20,
                left: -4,
                opacity: draggable ? 1 : 0,
                height: 32,
                width: 32,
                zIndex: 0,
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #bbb",
                borderRadius: "100%",
                pointerEvents: draggable ? "all" : "none",
              }}
              {...provided.dragHandleProps}
            >
              <Box
                sx={{
                  position: "relative",
                  left: "-4px",
                  pointerEvents: "none",
                  zIndex: 1,
                  paddingTop: "3px",
                }}
              >
                <Code size={14} style={{ transform: "rotate(90deg)" }} />
              </Box>
              <Box
                height={36}
                width={22}
                backgroundColor={"background"}
                sx={{
                  pointerEvents: "none",
                  position: "absolute",
                  top: "-2px",
                  left: "12px",
                  zIndex: 0,
                }}
              />
            </div>
          </div>
        )}
      </Draggable>
    </div>
  )
}
