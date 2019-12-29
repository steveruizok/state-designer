import React from "react"
import { Button } from "./Inputs"
import { Select } from "@rebass/forms"
import { List } from "./List"
import { FlatList } from "./FlatList"
import { CodeEditor, Fences } from "./CodeEditor"
import * as DS from "./types"

export interface Props {
  item: DS.HandlerItem
  items: DS.NamedFunction[]
  onChangeName: (code: string) => void
  onChangeCode: (code: string) => void
  onMoveDown: () => void
  onMoveUp: () => void
  onRemove: () => void
  canMoveDown: boolean
  canMoveUp: boolean
}

export const EventHandlerItem: React.FC<Props> = ({
  item,
  items,
  onChangeName,
  onChangeCode,
  onMoveDown,
  onMoveUp,
  onRemove,
  canMoveDown,
  canMoveUp
}) => {
  return (
    <List>
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
        <Button
          disabled={!canMoveDown}
          opacity={canMoveDown ? 1 : 0.5}
          onClick={onMoveDown}
        >
          ▼
        </Button>
        <Button
          disabled={!canMoveUp}
          opacity={canMoveUp ? 1 : 0.5}
          onClick={onMoveUp}
        >
          ▲
        </Button>
        <Button onClick={onRemove}>X</Button>
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
    </List>
  )
}
