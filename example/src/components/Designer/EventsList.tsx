import React from "react"
import { Button } from "./Inputs"
import { Box, Heading } from "rebass"
import { List } from "./List"
import { TitleRow } from "./TitleRow"
import { Event } from "./Event"
import { Item } from "./item/Item"
import { StateDesigner, useStateDesigner } from "state-designer"
import { EventsListConfig } from "./machines/eventsList"
import { AnimatePresence, motion } from "framer-motion"

export interface Props {
  state: StateDesigner<EventsListConfig>
  actions: any
  conditions: any
  onChange: (data: EventsListConfig["data"]) => void
}

export const EventsList: React.FC<Props> = ({
  state,
  onChange,
  conditions,
  actions,
  children
}) => {
  const { data, send } = useStateDesigner(state, state => onChange(state.data))
  const { items } = data

  return (
    <Item title={"Events"} titleSize={3} onCreate={() => send("CREATE_EVENT")}>
      {items.map((item, index) => {
        return (
          <Event
            key={item.id}
            event={item.item}
            actions={actions}
            conditions={conditions}
            onChange={() => onChange(data)}
            canMoveUp={index > 0 && items.length > 1}
            onMoveUp={() => send("MOVE_EVENT", { id: item.id, delta: -1 })}
            canMoveDown={index < items.length - 1}
            onMoveDown={() => send("MOVE_EVENT", { id: item.id, delta: 1 })}
            onRemove={() => send("REMOVE_EVENT", { id: item.id })}
          />
        )
      })}
    </Item>
  )
}
