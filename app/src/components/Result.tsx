import React from "react"
import { Collections } from "../machines/Collections"
import { useStateDesigner } from "state-designer"
import { CodeEditor, Fences } from "./CodeEditor"
import { DraggableItem } from "./DraggableItem"
import { ItemSelect } from "./ItemSelect"
import * as DS from "../interfaces"

export interface Props {
  handler: DS.EventHandler
  result: DS.Result
  dragId: string
  index: number
}

export const Result: React.FC<Props> = ({ handler, result, dragId, index }) => {
  const { data, send } = useStateDesigner(Collections.results)

  const options: { [key: string]: () => void } = {
    remove() {
      Collections.handlers.send("REMOVE_HANDLER_RESULT", {
        handlerId: handler.id,
        resultId: result.id,
      })
    },
    duplicate() {
      Collections.handlers.send("DUPLICATE_HANDLER_RESULT", {
        handlerId: handler.id,
        resultId: result.id,
      })
    },
  }

  if (index > 0) {
    options["move down"] = () =>
      Collections.handlers.send("MOVE_HANDLER_RESULT", {
        handlerId: handler.id,
        resultId: result.id,
        target: index - 1,
      })
  }

  if (index < handler.do.length - 1) {
    options["move up"] = () =>
      Collections.handlers.send("MOVE_HANDLER_RESULT", {
        handlerId: handler.id,
        resultId: result.id,
        target: index + 1,
      })
  }

  return (
    <DraggableItem
      draggable={handler.get.length > 1}
      draggableId={dragId}
      draggableIndex={index + 1}
      // title={`${handler.id} - Handler`}
      options={options}
      canSave={result.custom}
      onEdit={
        result.custom
          ? undefined
          : () => {
              const namedFunction = document.getElementById(
                `result-${result.id}`
              )
              if (!namedFunction) return
              namedFunction.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
              namedFunction.focus()
            }
      }
      onSave={
        result.custom
          ? () => send("SAVE_CUSTOM", { resultId: result.id })
          : undefined
      }
    >
      <ItemSelect
        value={result.custom ? "Custom" : result.id}
        onValueChange={id => {
          Collections.handlers.send("CHANGE_HANDLER_RESULT", {
            handlerId: handler.id,
            resultId: id,
            index,
          })
        }}
        source={data}
      />
      {result.custom && (
        <CodeEditor
          value={result.name}
          onChange={code =>
            send("EDIT", {
              resultId: result.id,
              changes: { name: code },
            })
          }
        />
      )}
      <CodeEditor
        value={result.code}
        readOnly={!result.custom}
        startWith={Fences.FunctionArgs}
        endWith={Fences.End}
        onChange={code =>
          send("EDIT", { resultId: result.id, changes: { code } })
        }
      />
    </DraggableItem>
  )
}
