import React from "react"
import sortBy from "lodash/sortBy"
import compact from "lodash/compact"
import { Box, Button } from "rebass"
import { Collections } from "../machines/Collections"
import { DragList } from "./DragList"
import { Title } from "./Title"
import { useStateDesigner } from "state-designer"
import { Select } from "@rebass/forms"
import { CodeEditor, Fences } from "./CodeEditor"
import { DraggableItem } from "./DraggableItem"
import * as DS from "../interfaces"

export interface Props {
  handler: DS.EventHandler
  action: DS.Action
  dragId: string
  index: number
}

export const Action: React.FC<Props> = ({
  handler,
  action,
  dragId,
  index,
  children
}) => {
  const { data, send } = useStateDesigner(Collections.actions)

  const options: { [key: string]: () => void } = {
    remove() {
      Collections.handlers.send("REMOVE_HANDLER_ACTION", {
        handlerId: handler.id,
        actionId: action.id
      })
    },
    duplicate() {
      Collections.handlers.send("DUPLICATE_HANDLER_ACTION", {
        handlerId: handler.id,
        actionId: action.id
      })
    }
  }

  if (index > 0) {
    options["move down"] = () =>
      Collections.handlers.send("MOVE_HANDLER_ACTION", {
        handlerId: handler.id,
        actionId: action.id,
        target: index - 1
      })
  }

  if (index < handler.do.length - 1) {
    options["move up"] = () =>
      Collections.handlers.send("MOVE_HANDLER_ACTION", {
        handlerId: handler.id,
        actionId: action.id,
        target: index + 1
      })
  }

  return (
    <DraggableItem
      draggable={handler.do.length > 1}
      draggableId={dragId}
      draggableIndex={index}
      // title={`${handler.id} - Handler`}
      options={options}
      canSave={action.custom}
      onEdit={
        action.custom
          ? undefined
          : () => {
              const namedFunction = document.getElementById(
                `action-${action.id}`
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
        action.custom
          ? () => send("SAVE_CUSTOM", { actionId: action.id })
          : undefined
      }
    >
      <NamedFunctionSelect
        value={action.custom ? "Custom" : action.id}
        onValueChange={id => {
          Collections.handlers.send("CHANGE_HANDLER_ACTION", {
            handlerId: handler.id,
            actionId: id,
            index
          })
        }}
        source={data}
      />
      {action.custom && (
        <CodeEditor
          value={action.name}
          onChange={code =>
            send("EDIT", {
              actionId: action.id,
              changes: { name: code }
            })
          }
        />
      )}
      <CodeEditor
        value={action.code}
        readOnly={!action.custom}
        startWith={Fences.FunctionArgs + Fences.Start}
        endWith={Fences.End}
        onChange={code =>
          send("EDIT", { actionId: action.id, changes: { code } })
        }
      />
    </DraggableItem>
  )
}

const NamedFunctionSelect: React.FC<{
  value: string
  onValueChange: (value: string) => void
  source: Map<string, DS.EventHandlerCallback>
}> = ({ value, onValueChange, source }) => {
  return (
    <Select value={value} onChange={e => onValueChange(e.target.value)}>
      <option value={"custom"}>Custom</option>
      {Array.from(source.values())
        .filter(v => !v.custom)
        .map(v => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
    </Select>
  )
}
