import React from "react"
import { Box, Heading } from "rebass"
import { EventConfig } from "./machines/event"
import { StateDesigner, useStateDesigner } from "state-designer"
import { Mover } from "./Mover"
import { MovingHeader } from "./MovingHeader"
import { EventHandlerItemList } from "./EventHandlerItemList"

import * as DS from "./types"

export interface Props {
  handler: DS.Handler
  event: StateDesigner<EventConfig>
  actions: DS.NamedAction[]
  conditions: DS.NamedCondition[]
  onChange: () => void
}

export const EventHandler: React.FC<Props> = ({
  handler,
  actions,
  conditions,
  event,
  onChange
}) => {
  const { can, send } = useStateDesigner(event, onChange)
  const { id } = handler

  const canMoveUp = can("MOVE_EVENT_HANDLER", { id, delta: -1 })
  const canMoveDown = can("MOVE_EVENT_HANDLER", { id, delta: 1 })

  return (
    <Mover>
      <Box
        m={1}
        p={1}
        sx={{
          backgroundColor: "rgba(255, 220, 255, .08)",
          border: "1px solid #ccc",
          borderRadius: 8,
          gap: 16
        }}
      >
        <MovingHeader
          canMoveDown={canMoveDown}
          canMoveUp={canMoveUp}
          onMoveDown={() => send("MOVE_EVENT_HANDLER", { id, delta: 1 })}
          onMoveUp={() => send("MOVE_EVENT_HANDLER", { id, delta: -1 })}
          onRemove={() => send("REMOVE_EVENT_HANDLER", { id })}
        >
          <Heading fontSize={3}>Event Handler</Heading>
        </MovingHeader>
        <EventHandlerItemList
          name="Action"
          items={handler.do}
          namedFunctions={actions}
          onCreate={() =>
            send("CREATE_HANDLER_ACTION", {
              handlerId: id,
              mustReturn: false
            })
          }
          canMove={(item: DS.HandlerItem, delta: number) =>
            can("MOVE_HANDLER_ACTION", {
              handlerId: id,
              id: item.id,
              delta
            })
          }
          onMove={(item: DS.HandlerItem, delta: number) =>
            send("MOVE_HANDLER_ACTION", {
              handlerId: id,
              id: item.id,
              delta
            })
          }
          onRemove={(item: DS.HandlerItem) =>
            send("REMOVE_HANDLER_ACTION", {
              handlerId: id,
              id: item.id
            })
          }
          onUpdateCode={(item: DS.HandlerItem, code: string) =>
            send("UPDATE_HANDLER_ACTION", {
              handlerId: id,
              id: item.id,
              name: item.name || "custom",
              code
            })
          }
          onUpdateName={(item: DS.HandlerItem, code: string) =>
            send("UPDATE_HANDLER_ACTION", {
              handlerId: id,
              id: item.id,
              code: item.code,
              name: code || "custom"
            })
          }
        />
        <EventHandlerItemList
          name="Condition"
          items={handler.if}
          namedFunctions={conditions}
          onCreate={() =>
            send("CREATE_HANDLER_CONDITION", {
              handlerId: id,
              mustReturn: false
            })
          }
          canMove={(item: DS.HandlerItem, delta: number) =>
            can("MOVE_HANDLER_CONDITION", {
              handlerId: id,
              id: item.id,
              delta
            })
          }
          onMove={(item: DS.HandlerItem, delta: number) =>
            send("MOVE_HANDLER_CONDITION", {
              handlerId: id,
              id: item.id,
              delta
            })
          }
          onRemove={(item: DS.HandlerItem) =>
            send("REMOVE_HANDLER_CONDITION", {
              handlerId: id,
              id: item.id
            })
          }
          onUpdateName={(item: DS.HandlerItem, code: string) =>
            send("UPDATE_HANDLER_CONDITION", {
              handlerId: id,
              id: item.id,
              code: item.code,
              name: code || "custom"
            })
          }
          onUpdateCode={(item: DS.HandlerItem, code: string) => {
            send("UPDATE_HANDLER_CONDITION", {
              handlerId: id,
              id: item.id,
              name: item.name || "custom",
              code
            })
          }}
        />
      </Box>
    </Mover>
  )
}
