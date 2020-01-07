import React from "react"
import { Collections } from "../../machines/Collections"
import { useStateDesigner } from "state-designer"
import { CodeEditor, Fences } from "../CodeEditor"
import { DraggableItem } from "../DraggableItem"
import * as DS from "../../interfaces"

export interface Props {
  result: DS.Result
  index: number
}

export const Result: React.FC<Props> = ({ result, index, children }) => {
  const { data, send } = useStateDesigner(Collections.results)

  const options: { [key: string]: () => void } = {
    remove() {
      send("REMOVE", {
        resultId: result.id
      })
    },
    duplicate() {
      send("DUPLICATE", {
        resultId: result.id
      })
    }
  }

  if (index > 0) {
    options["move down"] = () =>
      send("MOVE", {
        resultId: result.id,
        target: index - 1
      })
  }

  if (index < data.size - 1) {
    options["move up"] = () =>
      send("MOVE", {
        resultId: result.id,
        target: index + 1
      })
  }

  return (
    <DraggableItem
      id={`result-${result.id}`}
      key={result.id}
      draggable={data.size > 1}
      draggableId={result.id}
      draggableIndex={index + 1}
      // title={`${result.id}`}
      options={options}
    >
      <CodeEditor
        ignoreTab={true}
        value={result.name}
        onChange={code =>
          send("EDIT", {
            resultId: result.id,
            changes: { name: code }
          })
        }
      />
      <CodeEditor
        value={result.code}
        startWith={Fences.FunctionArgs}
        endWith={Fences.End}
        onChange={(code: string) =>
          send("EDIT", { resultId: result.id, changes: { code } })
        }
      />
    </DraggableItem>
  )
}
