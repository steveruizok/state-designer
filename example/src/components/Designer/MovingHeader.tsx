import React from "react"
import { Button } from "./Inputs"
import { FlatList } from "./FlatList"

export interface Props {
  onMoveDown: () => void
  onMoveUp: () => void
  onRemove: () => void
  canMoveDown: boolean
  canMoveUp: boolean
}

export const MovingHeader: React.FC<Props> = ({
  canMoveDown,
  canMoveUp,
  onMoveDown,
  onMoveUp,
  onRemove,
  children
}) => {
  return (
    <FlatList mb={3}>
      {children}
      <Button disabled={!canMoveDown} onClick={onMoveDown}>
        ▼
      </Button>
      <Button disabled={!canMoveUp} onClick={onMoveUp}>
        ▲
      </Button>
      <Button onClick={onRemove}>X</Button>
    </FlatList>
  )
}
