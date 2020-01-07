import React from "react"
import { Collections } from "../../machines/Collections"
import { useStateDesigner } from "state-designer"
import { CodeEditor, Fences } from "../CodeEditor"
import { DraggableItem } from "../DraggableItem"
import * as DS from "../../interfaces"

export interface Props {
  condition: DS.Condition
  index: number
}

export const Condition: React.FC<Props> = ({ condition, index, children }) => {
  const { data, send } = useStateDesigner(Collections.conditions)

  const options: { [key: string]: () => void } = {
    remove() {
      send("REMOVE", {
        conditionId: condition.id
      })
    },
    duplicate() {
      send("DUPLICATE", {
        conditionId: condition.id
      })
    }
  }

  if (index > 0) {
    options["move down"] = () =>
      send("MOVE", {
        conditionId: condition.id,
        target: index - 1
      })
  }

  if (index < data.size - 1) {
    options["move up"] = () =>
      send("MOVE", {
        conditionId: condition.id,
        target: index + 1
      })
  }

  return (
    <DraggableItem
      id={`condition-${condition.id}`}
      key={condition.id}
      draggable={data.size > 1}
      draggableId={condition.id}
      draggableIndex={index + 1}
      // title={`${condition.id}`}
      options={options}
    >
      <CodeEditor
        ignoreTab={true}
        value={condition.name}
        onChange={code =>
          send("EDIT", {
            conditionId: condition.id,
            changes: { name: code }
          })
        }
      />
      <CodeEditor
        value={condition.code}
        startWith={Fences.ConditionStart}
        endWith={Fences.End}
        onChange={(code: string) =>
          send("EDIT", { conditionId: condition.id, changes: { code } })
        }
      />
    </DraggableItem>
  )
}
