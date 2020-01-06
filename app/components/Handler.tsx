import React from "react"
import uniqueId from "lodash/uniqueId"
import compact from "lodash/compact"
import { Collections } from "../machines/Collections"
import { DragList } from "./DragList"
import { Title } from "./Title"
import { useStateDesigner } from "state-designer"
import { DraggableItem } from "./DraggableItem"
import { Action } from "./Action"
import * as DS from "../interfaces"

export interface Props {
  event: DS.Event
  handler: DS.EventHandler
  index: number
}

export const Handler: React.FC<Props> = ({
  event,
  handler,
  index,
  children
}) => {
  const results = useStateDesigner(Collections.results)
  const conditions = useStateDesigner(Collections.conditions)
  const actions = useStateDesigner(Collections.actions)

  const options: { [key: string]: () => void } = {
    remove() {
      Collections.events.send("REMOVE_EVENT_HANDLER", {
        eventId: event.id,
        handlerId: handler.id
      })
    },
    duplicate() {
      Collections.events.send("DUPLICATE_EVENT_HANDLER", {
        eventId: event.id,
        handlerId: handler.id
      })
    }
  }

  if (index > 0) {
    options["move down"] = () =>
      Collections.events.send("MOVE_EVENT_HANDLER", {
        eventId: event.id,
        handlerId: handler.id,
        target: index - 1
      })
  }

  if (index < event.handlers.length - 1) {
    options["move up"] = () =>
      Collections.events.send("MOVE_EVENT_HANDLER", {
        eventId: event.id,
        handlerId: handler.id,
        target: index + 1
      })
  }

  return (
    <DraggableItem
      key={handler.id}
      draggable={event.handlers.length > 1}
      draggableId={handler.id}
      draggableIndex={index}
      // title={`${handler.id} - Handler`}
      options={options}
    >
      <Title
        onCreate={() =>
          Collections.handlers.send("CREATE_HANDLER_RESULT", {
            handlerId: handler.id
          })
        }
      >
        get
      </Title>
      <DragList
        id="handler_results"
        onDragEnd={result =>
          result.destination &&
          Collections.handlers.send("MOVE_HANDLER_RESULT", {
            handlerId: handler.id,
            resultId: result.draggableId,
            target: result.destination.index
          })
        }
      >
        {handler.get.map((id, index) => {
          const result = results.data.get(id)
          if (!result) return
          return (
            <DraggableItem
              key={result.id}
              draggable={handler.get.length > 1}
              draggableId={result.id}
              draggableIndex={index}
              title={result.id}
            />
          )
        })}
      </DragList>
      <Title
        onCreate={() =>
          Collections.handlers.send("CREATE_HANDLER_IF_CONDITION", {
            handlerId: handler.id
          })
        }
      >
        if
      </Title>
      <DragList
        id="handler_conditions"
        onDragEnd={result =>
          result.destination &&
          Collections.handlers.send("MOVE_HANDLER_IF_CONDITION", {
            handlerId: handler.id,
            conditionId: result.draggableId,
            target: result.destination.index
          })
        }
      >
        {handler.if.map((id, index) => {
          const condition = conditions.data.get(id)
          if (!condition) return
          return (
            <DraggableItem
              key={condition.id}
              draggable={handler.if.length > 1}
              draggableId={condition.id}
              draggableIndex={index}
              title={condition.id}
            />
          )
        })}
      </DragList>
      <Title
        onCreate={() =>
          Collections.handlers.send("CREATE_HANDLER_ACTION", {
            handlerId: handler.id
          })
        }
      >
        do
      </Title>
      <DragList
        id="handler_actions"
        onDragEnd={result =>
          result.destination &&
          Collections.handlers.send("MOVE_HANDLER_ACTION", {
            handlerId: handler.id,
            actionRef: result.draggableId,
            target: result.destination.index
          })
        }
      >
        {handler.do.map(({ id, ref }, index) => {
          const action = actions.data.get(id)
          if (!action) return

          return (
            <Action
              key={ref}
              dragId={ref}
              index={index}
              action={action}
              handler={handler}
            />
          )
        })}
      </DragList>
    </DraggableItem>
  )
}
