import React from "react"
import { EventConfig } from "./machines/event"
import { StateDesigner, useStateDesigner } from "state-designer"
import { Title } from "./item/Title"
import { DraggableItem } from "./item/DraggableItem"
import { EventHandlerItemList } from "./EventHandlerItemList"

import * as DS from "./types"

export interface Props {
  handler: DS.Handler
  event: StateDesigner<EventConfig>
  actions: DS.NamedAction[]
  conditions: DS.NamedCondition[]
  onChange: () => void
  draggable: boolean
  draggableId: string
  draggableIndex: number
}

export const EventHandler: React.FC<Props> = ({
  handler,
  actions,
  conditions,
  event,
  onChange,
  draggable,
  draggableId,
  draggableIndex
}) => {
  const { can, send } = useStateDesigner(event, onChange)

  function handleMoreSelect(option: string) {
    switch (option) {
      case "Move Up": {
        send("MOVE_EVENT_HANDLER", {
          id: handler.id,
          target: draggableIndex - 1
        })
        break
      }
      case "Move Down": {
        send("MOVE_EVENT_HANDLER", {
          id: handler.id,
          target: draggableIndex + 1
        })
        break
      }
      case "Delete": {
        send("REMOVE_EVENT_HANDLER", { id: handler.id })
        break
      }
      case "Duplicate": {
        send("DUPLICATE_EVENT_HANDLER", { id: handler.id })
        break
      }
    }
  }

  let options = ["Duplicate", "Delete"]

  if (can("MOVE_EVENT_HANDLER", { id: handler.id, target: draggableIndex - 1 }))
    options.unshift("Move Down")
  if (can("MOVE_EVENT_HANDLER", { id: handler.id, target: draggableIndex + 1 }))
    options.unshift("Move Up")

  return (
    <DraggableItem
      {...{
        draggable,
        draggableId,
        draggableIndex,
        options
      }}
      onMoreSelect={handleMoreSelect}
      title=""

      // onMoveDown={() =>
      //   send("MOVE_EVENT_HANDLER", { id: handler.id, delta: 1 })
      // }
      // onMoveUp={() =>
      //   send("MOVE_EVENT_HANDLER", { id: handler.id, delta: -1 })
      // }
      // onRemove={() => send("REMOVE_EVENT_HANDLER", { id: handler.id })}
    >
      <Title
        onCreate={() =>
          send("CREATE_HANDLER_ACTION", {
            handlerId: handler.id,
            mustReturn: false
          })
        }
      >
        Actions
      </Title>
      <EventHandlerItemList
        name="Action"
        items={handler.do}
        namedFunctions={actions}
        onDuplicate={(item: DS.HandlerItem) =>
          send("DUPLICATE_HANDLER_ACTION", {
            handlerId: handler.id,
            id: item.id
          })
        }
        canMove={(id: string, target: number) =>
          can("MOVE_HANDLER_ACTION", {
            handlerId: handler.id,
            id,
            target
          })
        }
        onMove={(id: string, target: number) =>
          send("MOVE_HANDLER_ACTION", {
            handlerId: handler.id,
            id,
            target
          })
        }
        onRemove={(item: DS.HandlerItem) =>
          send("REMOVE_HANDLER_ACTION", {
            handlerId: handler.id,
            id: item.id
          })
        }
        onUpdateCode={(item: DS.HandlerItem, code: string) =>
          send("UPDATE_HANDLER_ACTION", {
            handlerId: handler.id,
            id: item.id,
            name: item.name || "custom",
            code
          })
        }
        onUpdateName={(item: DS.HandlerItem, code: string) =>
          send("UPDATE_HANDLER_ACTION", {
            handlerId: handler.id,
            id: item.id,
            code: item.code,
            name: code || "custom"
          })
        }
      />
      <Title
        onCreate={() =>
          send("CREATE_HANDLER_CONDITION", {
            handlerId: handler.id,
            mustReturn: true
          })
        }
      >
        Conditions
      </Title>
      <EventHandlerItemList
        name="Condition"
        items={handler.if}
        namedFunctions={conditions}
        onDuplicate={(item: DS.HandlerItem) =>
          send("DUPLICATE_HANDLER_CONDITION", {
            handlerId: handler.id,
            id: item.id
          })
        }
        canMove={(id: string, target: number) =>
          can("MOVE_HANDLER_CONDITION", {
            handlerId: handler.id,
            id,
            target
          })
        }
        onMove={(id: string, target: number) =>
          send("MOVE_HANDLER_CONDITION", {
            handlerId: handler.id,
            id,
            target
          })
        }
        onRemove={(item: DS.HandlerItem) =>
          send("REMOVE_HANDLER_CONDITION", {
            handlerId: handler.id,
            id: item.id
          })
        }
        onUpdateName={(item: DS.HandlerItem, code: string) =>
          send("UPDATE_HANDLER_CONDITION", {
            handlerId: handler.id,
            id: item.id,
            code: item.code,
            name: code || "custom"
          })
        }
        onUpdateCode={(item: DS.HandlerItem, code: string) => {
          send("UPDATE_HANDLER_CONDITION", {
            handlerId: handler.id,
            id: item.id,
            name: item.name || "custom",
            code
          })
        }}
      />
    </DraggableItem>
  )
}
