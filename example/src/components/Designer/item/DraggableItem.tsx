import React from "react"
import { Box, Text } from "rebass"
import { Code, Check, MoreHorizontal, X, Plus } from "react-feather"
import { Item } from "./Item"
import { Draggable } from "react-beautiful-dnd"

export interface Props {
  draggable: boolean
  draggableId: string
  draggableIndex: number
  title?: string
  editing?: boolean
  dirty?: boolean
  options?: string[]
  error?: string
  onSave?: () => void
  onCancel?: () => void
  onMoreSelect?: (value: string) => void
  onCreate?: () => void
}

export const DraggableItem: React.FC<Props> = ({
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
              <Box
                {...provided.dragHandleProps}
                p={2}
                sx={{
                  position: "absolute",
                  top: 3,
                  left: -1,
                  backgroundColor: "background",
                  opacity: draggable ? 1 : 0
                }}
              >
                <Code size={16} style={{ transform: "rotate(90deg)" }} />
              </Box>
            }
          </div>
        </div>
      )}
    </Draggable>
  )
}
