import React from "react"
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder
} from "react-beautiful-dnd"

export interface Props {
  id: string
  onDragEnd: OnDragEndResponder
}

export const DragList: React.FC<Props> = ({ id, onDragEnd, children }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={id}>
        {provided => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {children}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
