import React from "react"
import { Button } from "./Inputs"
import { Box } from "rebass"
import { Label, Input } from "@rebass/forms"
import { StateDesigner, useStateDesigner } from "state-designer"
import { NamedFunctionConfig } from "./machines/namedFunction"
import { List } from "./List"
import { FlatList } from "./FlatList"
import { CodeEditor, Fences } from "./CodeEditor"
import { SaveCancelButtons } from "./SaveCancelButtons"
import { DraggableItem } from "./item/DraggableItem"

export const NamedFunction: React.FC<{
  state: StateDesigner<NamedFunctionConfig>
  onMoveUp: any
  onMoveDown: any
  canDrag: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onDuplicate: any
  onChange: any
  onRemove: any
  draggable: boolean
  draggableId: string
  draggableIndex: number
}> = ({
  state,
  onChange,
  onMoveDown = () => {},
  onMoveUp = () => {},
  canMoveDown,
  canMoveUp,
  canDrag,
  onDuplicate = () => {},
  onRemove = () => {},
  draggable,
  draggableId,
  draggableIndex
}) => {
  const { data, send, can } = useStateDesigner(state, onChange)
  const { id, editing, dirty, clean, error, hasChanges } = data

  React.useEffect(
    function enableKeyboardSave() {
      function keyBoardSave(this: HTMLElement, e: KeyboardEvent) {
        if (e.key === "s" && e.metaKey) {
          e.preventDefault()
          send("SAVE")
        }
      }
      if (editing) {
        document.body.addEventListener("keydown", keyBoardSave)
      }
      return () => document.body.removeEventListener("keydown", keyBoardSave)
    },
    [editing]
  )

  function handleMoreSelect(option: string) {
    switch (option) {
      case "Cancel": {
        send("CANCEL")
        break
      }
      case "Save": {
        send("SAVE")
        break
      }
      case "Move Up": {
        onMoveUp()
        break
      }
      case "Move Down": {
        onMoveDown()
        break
      }
      case "Edit": {
        send("EDIT")
        break
      }
      case "Delete": {
        onRemove()
        break
      }
      case "Duplicate": {
        onDuplicate()
        break
      }
    }
  }

  let options = ["Edit", "Duplicate", "Delete"]

  if (editing) {
    if (hasChanges) options.unshift("Save")
    options.unshift("Cancel")
  } else {
    if (canMoveDown) options.unshift("Move Down")
    if (canMoveUp) options.unshift("Move Up")
  }

  return (
    <DraggableItem
      {...{
        draggable,
        draggableId,
        draggableIndex,
        error,
        options,
        editing
      }}
      onMoreSelect={handleMoreSelect}
      draggable={canDrag}
      dirty={hasChanges}
      onCancel={() => send("CANCEL")}
      onSave={() => send("SAVE")}
    >
      <List>
        <CodeEditor
          ignoreTab={true}
          value={dirty.name}
          readOnly={!editing}
          onFocus={() => send("EDIT")}
          onChange={code => send("UPDATE_NAME", code)}
        />
        {editing && (
          <CodeEditor
            ignoreTab={false}
            value={dirty.code}
            startWith={Fences.FunctionArgs + Fences.Start}
            endWith={Fences.End}
            onBlur={() => send("BLUR")}
            onChange={code => send("UPDATE_CODE", code)}
          />
        )}
      </List>
    </DraggableItem>
  )
}
