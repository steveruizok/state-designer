import React from "react"
import { Collections } from "../machines/Collections"
import { DragList } from "./DragList"
import * as DS from "../interfaces"
import { useStateDesigner } from "state-designer"
import { Event } from "./Event"

export interface Props {
  state: DS.State
}

export const StateEvents: React.FC<Props> = ({ state }) => {
  const { data } = useStateDesigner(Collections.events)

  return (
    <DragList
      id="state_events"
      onDragEnd={function(result) {
        result.destination &&
          Collections.states.send("MOVE_EVENT", {
            id: state.id,
            eventId: result.draggableId,
            target: result.destination.index - 1,
          })
      }}
    >
      {state.events.map((id, index) => {
        const event = data.get(id)
        if (!event) return
        return (
          <Event key={event.id} state={state} event={event} index={index} />
        )
      })}
    </DragList>
  )
}
