import React from "react"
import { Collections } from "../machines/Collections"
import { useStateDesigner } from "state-designer"
import { CodeEditor, Fences } from "./CodeEditor"
import { DraggableItem } from "./DraggableItem"
import { ItemSelect } from "./ItemSelect"
import * as DS from "../interfaces"

export interface Props {
  handler: DS.EventHandler
  condition: DS.Condition
  dragId: string
  index: number
}

export const Condition: React.FC<Props> = ({
  handler,
  condition,
  dragId,
  index,
  children
}) => {
  const { data, send } = useStateDesigner(Collections.conditions)

  const options: { [key: string]: () => void } = {
    remove() {
      Collections.handlers.send("REMOVE_HANDLER_IF_CONDITION", {
        handlerId: handler.id,
        conditionId: condition.id
      })
    },
    duplicate() {
      Collections.handlers.send("DUPLICATE_HANDLER_IF_CONDITION", {
        handlerId: handler.id,
        conditionId: condition.id
      })
    }
  }

  if (index > 0) {
    options["move down"] = () =>
      Collections.handlers.send("MOVE_HANDLER_IF_CONDITION", {
        handlerId: handler.id,
        conditionId: condition.id,
        target: index - 1
      })
  }

  if (index < handler.do.length - 1) {
    options["move up"] = () =>
      Collections.handlers.send("MOVE_HANDLER_IF_CONDITION", {
        handlerId: handler.id,
        conditionId: condition.id,
        target: index + 1
      })
  }

  return (
    <DraggableItem
      draggable={handler.if.length > 1}
      draggableId={dragId}
      draggableIndex={index + 1}
      // title={`${handler.id} - Handler`}
      options={options}
      canSave={condition.custom}
      onEdit={
        condition.custom
          ? undefined
          : () => {
              const namedFunction = document.getElementById(
                `condition-${condition.id}`
              )
              if (!namedFunction) return
              namedFunction.scrollIntoView({
                behavior: "smooth",
                block: "start"
              })
              namedFunction.focus()
            }
      }
      onSave={
        condition.custom
          ? () => send("SAVE_CUSTOM", { conditionId: condition.id })
          : undefined
      }
    >
      <ItemSelect
        value={condition.custom ? "Custom" : condition.id}
        onValueChange={id => {
          console.log(handler.id, id)
          Collections.handlers.send("CHANGE_HANDLER_IF_CONDITION", {
            handlerId: handler.id,
            conditionId: id,
            index
          })
        }}
        source={data}
      />
      {condition.custom && (
        <CodeEditor
          value={condition.name}
          onChange={code =>
            send("EDIT", {
              conditionId: condition.id,
              changes: { name: code }
            })
          }
        />
      )}
      <CodeEditor
        value={condition.code}
        readOnly={!condition.custom}
        startWith={Fences.FunctionArgs + Fences.Start}
        endWith={Fences.End}
        onChange={code =>
          send("EDIT", { conditionId: condition.id, changes: { code } })
        }
      />
    </DraggableItem>
  )
}
