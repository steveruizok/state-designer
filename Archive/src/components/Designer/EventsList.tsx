import React from "react"
import { Event } from "./Event"
import { Item } from "./item/Item"
import { StateDesigner, useStateDesigner } from "state-designer"
import { EventsListConfig } from "./machines/eventsList"

export interface Props {
  state: StateDesigner<EventsListConfig>
  actions: any
  conditions: any
  onEventFire: (name: string) => void
  canEventFire: (name: string) => boolean
  onChange: (data: EventsListConfig["data"]) => void
}

export const EventsList: React.FC<Props> = ({
  state,
  onChange,
  conditions,
  actions,
  canEventFire,
  onEventFire,
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
            onEventFire={onEventFire}
            canEventFire={canEventFire(item.item.data.clean.name)}
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
