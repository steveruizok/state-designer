import React from "react"
import { Box, Flex, Text } from "rebass"
import { Code, Check, MoreHorizontal, X, Plus } from "react-feather"
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
    <Draggable draggableId={draggableId} index={draggableIndex}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <div style={{ position: "relative" }}>
            <Item {...rest} />
            {
              <Flex
                {...provided.dragHandleProps}
                p={2}
                sx={{
                  position: "absolute",
                  top: 3,
                  left: -2,
                  backgroundColor: "background",
                  opacity: draggable ? 1 : 0,
                  height: 32,
                  width: 32,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Code size={14} style={{ transform: "rotate(90deg)" }} />
              </Flex>
            }
          </div>
        </div>
      )}
    </Draggable>
  )
}
