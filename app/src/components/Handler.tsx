import React from "react"
import { Collections } from "../machines/Collections"
import { CodeEditor } from "./CodeEditor"
import { DragList } from "./DragList"
import { Title } from "./Title"
import { Item } from "./Item"
import { useStateDesigner } from "state-designer"
import { DraggableItem } from "./DraggableItem"
import { Condition } from "./Condition"
import { Action } from "./Action"
import { Result } from "./Result"
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
  children,
}) => {
  const results = useStateDesigner(Collections.results)
  const conditions = useStateDesigner(Collections.conditions)
  const actions = useStateDesigner(Collections.actions)

  const options: { [key: string]: () => void } = {
    remove() {
      Collections.events.send("REMOVE_HANDLER", {
        eventId: event.id,
        handlerId: handler.id,
      })
    },
    duplicate() {
      Collections.events.send("DUPLICATE_HANDLER", {
        eventId: event.id,
        handlerId: handler.id,
      })
    },
  }

  if (index > 0) {
    options["move down"] = () =>
      Collections.events.send("MOVE_HANDLER", {
        eventId: event.id,
        handlerId: handler.id,
        target: index - 1,
      })
  }

  if (index < event.handlers.length - 1) {
    options["move up"] = () =>
      Collections.events.send("MOVE_HANDLER", {
        eventId: event.id,
        handlerId: handler.id,
        target: index + 1,
      })
  }

  return (
    <DraggableItem
      key={handler.id}
      draggable={event.handlers.length > 1}
      draggableId={handler.id}
      draggableIndex={index + 1}
      // title={`${handler.id}`}
      options={options}
    >
      <Title
        onCreate={() =>
          Collections.handlers.send("CREATE_HANDLER_RESULT", {
            handlerId: handler.id,
          })
        }
      >
        Get
      </Title>
      {/* RESULTS */}
      <DragList
        id="handler_results"
        onDragEnd={result =>
          result.destination &&
          Collections.handlers.send("MOVE_HANDLER_RESULT", {
            handlerId: handler.id,
            resultRef: result.draggableId,
            target: result.destination.index - 1,
          })
        }
      >
        {handler.get.map(({ id, ref }, index) => {
          const result = results.data.get(id)
          if (!result) return

          return (
            <Result
              key={ref}
              dragId={ref}
              index={index}
              result={result}
              handler={handler}
            />
          )
        })}
      </DragList>
      {/* CONDITIONS */}
      <Title
        onCreate={() =>
          Collections.handlers.send("CREATE_HANDLER_IF_CONDITION", {
            handlerId: handler.id,
          })
        }
      >
        If
      </Title>
      <DragList
        id="handler_conditions"
        onDragEnd={result =>
          result.destination &&
          Collections.handlers.send("MOVE_HANDLER_IF_CONDITION", {
            handlerId: handler.id,
            conditionRef: result.draggableId,
            target: result.destination.index - 1,
          })
        }
      >
        {handler.if.map(({ id, ref }, index) => {
          const condition = conditions.data.get(id)
          if (!condition) return

          return (
            <Condition
              key={ref}
              dragId={ref}
              index={index}
              condition={condition}
              handler={handler}
            />
          )
        })}
      </DragList>
      {/* ACTIONS */}
      <Title
        onCreate={() =>
          Collections.handlers.send("CREATE_HANDLER_ACTION", {
            handlerId: handler.id,
          })
        }
      >
        Do
      </Title>
      <DragList
        id="handler_actions"
        onDragEnd={result => {
          result.destination &&
            Collections.handlers.send("MOVE_HANDLER_ACTION", {
              handlerId: handler.id,
              actionRef: result.draggableId,
              target: result.destination.index - 1,
            })
        }}
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
      <Title>To</Title>
      <CodeEditor
        value={handler.to}
        onChange={code =>
          Collections.handlers.send("EDIT_HANDLER_TRANSITION", {
            code,
            handlerId: handler.id,
          })
        }
      />
    </DraggableItem>
  )
}
