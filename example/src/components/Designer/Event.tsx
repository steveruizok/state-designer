import React from "react"
import { Button } from "./Inputs"
import { Flex, Box, Heading } from "rebass"
import { EventConfig } from "./machines/event"
import { Send } from "react-feather"
import { StateDesigner, useStateDesigner } from "state-designer"
import { TitleRow } from "./TitleRow"
import { List } from "./List"
import { CodeEditor } from "./CodeEditor"
import { ClosedEvent } from "./ClosedEvent"
import { SaveCancelButtons } from "./SaveCancelButtons"
import { Mover } from "./Mover"
import { MovingHeader } from "./MovingHeader"
import { AnimatePresence } from "framer-motion"
import { EventHandler } from "./EventHandler"
import { EventHandlerItemList } from "./EventHandlerItemList"
import { Item } from "./item/Item"
import { FlatList } from "./FlatList"
import { DraggableItem } from "./item/DraggableItem"
import { Title } from "./item/Title"
import { DragDropContext, Droppable } from "react-beautiful-dnd"
import * as DS from "./types"

export interface Props {
  event: StateDesigner<EventConfig>
  actions: DS.NamedAction[]
  conditions: DS.NamedCondition[]
  onChange: () => void
  onMoveDown: () => void
  onMoveUp: () => void
  onRemove: () => void
  canMoveDown: boolean
  canMoveUp: boolean
  canEventFire: boolean
  onEventFire: (name: string) => void
}

// TODO:
// - Controls to edit / save / cancel event edits
// - Controls to move / remove events
// - Controls to move / remove event handlers
// - Controls to move / remove event handler items
// - Controls to turn event handler item into named functions

export const Event: React.FC<Props> = ({
  event,
  actions,
  conditions,
  onChange,
  onRemove,
  canEventFire,
  onEventFire
}) => {
  const { data, can, send } = useStateDesigner(event, onChange)
  const { id, editing, dirty } = data
  const { name, handlers } = dirty

  return (
    <Item
      error={can("SAVE_EVENT_EDIT") ? "" : "x"}
      onCancel={() => send("CANCEL_EVENT_EDIT")}
      onSave={() => send("SAVE_EVENT_EDIT")}
      dirty={editing}
      editing={editing}
      options={["Delete"]}
      onMoreSelect={option => option === "Delete" && onRemove()}
    >
      <FlatList>
        <CodeEditor
          value={name}
          onChange={code => send("UPDATE_NAME", { name: code.toUpperCase() })}
          onFocus={() => send("EDIT_EVENT")}
        />
        {editing || (
          <Button
            onClick={() => onEventFire(data.clean.name)}
            disabled={!canEventFire}
          >
            <Send size={15} />
          </Button>
        )}
      </FlatList>
      {editing && (
        <>
          <Title onCreate={() => send("CREATE_EVENT_HANDLER")}>
            Event Handlers
          </Title>
          <DragDropContext
            onDragEnd={result => {
              if (!result.destination) return

              send("MOVE_EVENT_HANDLER", {
                id: result.draggableId,
                target: result.destination.index
              })
            }}
          >
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {handlers.map((handler, index) => (
                    <EventHandler
                      draggable={handlers.length > 1}
                      draggableId={handler.id}
                      draggableIndex={index}
                      key={handler.id}
                      handler={handler}
                      event={event}
                      onChange={onChange}
                      actions={actions}
                      conditions={conditions}
                    />
                  ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
    </Item>
  )
}
