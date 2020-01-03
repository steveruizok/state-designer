import React from "react"
import { Select } from "@rebass/forms"
import { List } from "./List"
import { FlatList } from "./FlatList"
import { CodeEditor, Fences } from "./CodeEditor"
import { DraggableItem } from "./item/DraggableItem"
import * as DS from "./types"

export interface Props {
  title: string
  item: DS.HandlerItem
  items: DS.NamedFunction[]
  onChangeName: (code: string) => void
  onChangeCode: (code: string) => void
  onMoveDown: () => void
  onMoveUp: () => void
  onRemove: () => void
  onDuplicate: () => void
  canMoveDown: boolean
  canMoveUp: boolean
  draggable: boolean
  draggableId: string
  draggableIndex: number
}

export const EventHandlerItem: React.FC<Props> = ({
  title,
  item,
  items,
  onChangeName,
  onChangeCode,
  onMoveDown,
  onMoveUp,
  onRemove,
  onDuplicate,
  canMoveDown,
  canMoveUp,
  draggable,
  draggableId,
  draggableIndex
}) => {
  function handleMoreSelect(option: string) {
    switch (option) {
      case "Move Up": {
        onMoveUp()
        break
      }
      case "Move Down": {
        onMoveDown()
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

  let options = ["Duplicate", "Delete"]

  if (canMoveDown) options.unshift("Move Down")
  if (canMoveUp) options.unshift("Move Up")

  return (
    <DraggableItem
      title={title}
      {...{
        draggable,
        draggableId,
        draggableIndex,
        options
      }}
      onMoreSelect={handleMoreSelect}
    >
      <FlatList>
        <Select
          backgroundColor="#fafafa"
          sx={{
            border: "1px solid #ccc"
          }}
          value={item.type === DS.HandlerItems.Custom ? "custom" : item.name}
          onChange={(e: any) => onChangeName(e.target.value)}
        >
          {["custom", ...items.map(item => item.name)].map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </FlatList>
      {item.type === DS.HandlerItems.Custom && (
        <CodeEditor
          startWith={Fences.FunctionArgs + Fences.Start}
          endWith={Fences.End}
          value={item.code}
          error={item.error}
          onChange={onChangeCode}
        />
      )}
    </DraggableItem>
  )
}
