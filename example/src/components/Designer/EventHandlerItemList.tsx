import React from "react"
import { Heading } from "rebass"
import { Button } from "./Inputs"
import { List } from "./List"
import { TitleRow } from "./TitleRow"
import { EventHandlerItem } from "./EventHandlerItem"
import { Item } from "./item/Item"
import { DragDropContext, Droppable } from "react-beautiful-dnd"

import * as DS from "./types"

export interface Props {
  name: string
  items: DS.HandlerItem[]
  namedFunctions: DS.NamedFunction[]
  onDuplicate: (item: DS.HandlerItem) => void
  onUpdateName: (item: DS.HandlerItem, code: string) => void
  onUpdateCode: (item: DS.HandlerItem, name: string) => void
  canMove: (id: string, target: number) => boolean
  onMove: (id: string, target: any) => void
  onRemove: (item: DS.HandlerItem) => void
}

export const EventHandlerItemList: React.FC<Props> = ({
  name,
  items,
  namedFunctions,
  canMove,
  onMove,
  onUpdateName,
  onUpdateCode,
  onDuplicate,
  onRemove
}) => {
  return (
    <DragDropContext
      onDragEnd={result => onMove(result.draggableId, result.destination)}
    >
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {items.map((item, index) => {
              return (
                <EventHandlerItem
                  title={""}
                  draggable={items.length > 1}
                  draggableId={item.id}
                  draggableIndex={index}
                  key={item.id}
                  item={item}
                  items={namedFunctions}
                  canMoveDown={canMove(item.id, index + 1)}
                  canMoveUp={canMove(item.id, index - 1)}
                  onMoveDown={() => onMove(item.id, index + 1)}
                  onMoveUp={() => onMove(item.id, index - 1)}
                  onRemove={() => onRemove(item)}
                  onDuplicate={() => onDuplicate(item)}
                  onChangeCode={code => onUpdateCode(item, code)}
                  onChangeName={code => onUpdateName(item, code || "custom")}
                />
              )
            })}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
