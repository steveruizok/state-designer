import React from "react"
import { Heading } from "rebass"
import { Button } from "./Inputs"
import { List } from "./List"
import { TitleRow } from "./TitleRow"
import { Mover } from "./Mover"
import { EventHandlerItem } from "./EventHandlerItem"
import { AnimatePresence } from "framer-motion"

import * as DS from "./types"

export interface Props {
  name: string
  items: DS.HandlerItem[]
  namedFunctions: DS.NamedFunction[]
  onUpdateName: (item: DS.HandlerItem, code: string) => void
  onUpdateCode: (item: DS.HandlerItem, name: string) => void
  canMove: (item: DS.HandlerItem, delta: number) => boolean
  onMove: (item: DS.HandlerItem, delta: number) => void
  onRemove: (item: DS.HandlerItem) => void
  onCreate: () => void
}

export const EventHandlerItemList: React.FC<Props> = ({
  name,
  items,
  namedFunctions,
  canMove,
  onMove,
  onCreate,
  onUpdateName,
  onUpdateCode,
  onRemove
}) => {
  return (
    <List
      mb={3}
      p={2}
      sx={{
        backgroundColor: "rgba(255, 220, 255, .08)",
        border: "1px solid #ccc",
        borderRadius: 8,
        gap: 16
      }}
    >
      <TitleRow>
        <Heading fontSize={3}>{name}s</Heading>
        <Button onClick={onCreate}>Add {name}</Button>
      </TitleRow>
      <AnimatePresence>
        {items.map(item => {
          return (
            <Mover key={item.id}>
              <EventHandlerItem
                key={item.id}
                item={item}
                items={namedFunctions}
                canMoveDown={canMove(item, 1)}
                canMoveUp={canMove(item, -1)}
                onMoveDown={() => onMove(item, 1)}
                onMoveUp={() => onMove(item, -1)}
                onRemove={() => onRemove(item)}
                onChangeCode={code => onUpdateCode(item, code)}
                onChangeName={code => onUpdateName(item, code || "custom")}
              />
            </Mover>
          )
        })}
      </AnimatePresence>
    </List>
  )
}
