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
import { Item } from "./item/Item"

export const NamedFunction: React.FC<{
  state: StateDesigner<NamedFunctionConfig>
  onMoveUp: any
  onMoveDown: any
  canMoveUp: boolean
  canMoveDown: boolean
  onDuplicate: any
  onChange: any
  onRemove: any
}> = ({
  state,
  onChange,
  onMoveDown = () => {},
  onMoveUp = () => {},
  canMoveDown,
  canMoveUp,
  onDuplicate = () => {},
  onRemove = () => {}
}) => {
  const { data, send, can } = useStateDesigner(state, onChange)
  const { id, editing, dirty, clean, error, hasChanges } = data

  React.useEffect(
    function enableKeyboardSave() {
      function keyBoardSave(this: HTMLElement, e: KeyboardEvent) {
        if (e.key === "s" && e.metaKey) {
          e.preventDefault()
          console.log("save")
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
    <Item
      error={error}
      options={options}
      onMoreSelect={handleMoreSelect}
      editing={editing}
      dirty={hasChanges}
      onCancel={() => send("CANCEL")}
      onSave={() => send("SAVE")}
    >
      <List>
        <CodeEditor
          value={dirty.name}
          readOnly={!editing}
          onFocus={() => send("EDIT")}
          onChange={code => send("UPDATE_NAME", code)}
        />
        {editing && (
          <CodeEditor
            value={dirty.code}
            startWith={Fences.FunctionArgs + Fences.Start}
            endWith={Fences.End}
            onChange={code => send("UPDATE_CODE", code)}
          />
        )}
      </List>
    </Item>
  )
}
