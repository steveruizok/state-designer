import React from "react"
import { Collections } from "../../machines/Collections"
import { useStateDesigner } from "state-designer"
import { CodeEditor, Fences } from "../CodeEditor"
import { DraggableItem } from "../DraggableItem"
import * as DS from "../../interfaces"

export interface Props {
  action: DS.Action
  index: number
}

export const Action: React.FC<Props> = ({ action, index, children }) => {
  const { data, send } = useStateDesigner(Collections.actions)

  const options: { [key: string]: () => void } = {
    remove() {
      send("REMOVE", {
        actionId: action.id
      })
    },
    duplicate() {
      send("DUPLICATE", {
        actionId: action.id
      })
    }
  }

  if (index > 0) {
    options["move down"] = () =>
      send("MOVE", {
        actionId: action.id,
        target: index - 1
      })
  }

  if (index < data.size - 1) {
    options["move up"] = () =>
      send("MOVE", {
        actionId: action.id,
        target: index + 1
      })
  }

  return (
    <DraggableItem
      id={`action-${action.id}`}
      key={action.id}
      draggable={data.size > 1}
      draggableId={action.id}
      draggableIndex={index}
      title={`${action.id}`}
      options={options}
    >
      <CodeEditor
        ignoreTab={true}
        value={action.name}
        onChange={code =>
          send("EDIT", {
            actionId: action.id,
            changes: { name: code }
          })
        }
      />
      <CodeEditor
        value={action.code}
        startWith={Fences.FunctionArgs + Fences.Start}
        endWith={Fences.End}
        onChange={(code: string) =>
          send("EDIT", { actionId: action.id, changes: { code } })
        }
      />
    </DraggableItem>
  )
}
