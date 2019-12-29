import React from "react"
import { Button } from "./Inputs"
import { FlatList } from "./FlatList"
import { CodeEditor } from "./CodeEditor"

export interface Props {
  name: string
  canMoveDown: boolean
  canMoveUp: boolean
  onMoveDown: () => void
  onMoveUp: () => void
  onRemove: () => void
  onEdit: () => void
}

export const ClosedEvent: React.FC<Props> = ({
  name,
  canMoveDown,
  canMoveUp,
  onMoveDown,
  onMoveUp,
  onEdit,
  onRemove
}) => {
  return (
    <FlatList>
      <CodeEditor value={name} highlight={false} readOnly />
      <Button onClick={onEdit}>Edit</Button>
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
  )
}
