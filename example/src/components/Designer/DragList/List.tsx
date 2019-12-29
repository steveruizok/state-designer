import React from "react"
import { Box } from "rebass"
import { Item } from "./Item"
import { findIndex, Position } from "./utils"

export interface ItemProps {
  id: string
  [key: string]: any
}

export type Props = {}

export const List: React.FC<Props> = ({ children }) => {
  const positions = React.useRef<Position[]>([]).current
  const setPosition = (i: number, offset: Position) => (positions[i] = offset)

  const moveItem = (i: number, dragOffset: number) => {
    const targetIndex = findIndex(i, dragOffset, positions)
    if (targetIndex !== i) {
      console.log(targetIndex)
      // move the item to the new index
    }
  }

  return (
    <Box>
      <ul>
        {React.Children.map(children, (node, index) => (
          <Item
            key={index}
            index={index}
            setPosition={setPosition}
            moveItem={moveItem}
          >
            {node}
          </Item>
        ))}
      </ul>
    </Box>
  )
}
