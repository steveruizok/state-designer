import * as React from "react"
import { DragDropContext, Droppable } from "react-beautiful-dnd"

export const DragDropList: React.FC<{
  id: string
  type: string
}> = ({ id, type, children }) => {
  return (
    <Droppable droppableId={id} type={type}>
      {(provided) => (
        <ul {...provided.droppableProps} ref={provided.innerRef}>
          {children}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  )
}
