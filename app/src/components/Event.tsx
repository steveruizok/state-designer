import React from "react"
import sortBy from "lodash/sortBy"
import compact from "lodash/compact"
import { Collections } from "../machines/Collections"
import { DragList } from "./DragList"
import { Handler } from "./Handler"
import { useStateDesigner } from "state-designer"
import { DraggableItem } from "../components/DraggableItem"
import * as DS from "../interfaces"

export interface Props {
  state: DS.State
  event: DS.Event
  index: number
}

export const Event: React.FC<Props> = ({ event, state, index, children }) => {
  const { data } = useStateDesigner(Collections.handlers)

  const handlers = event.handlers.map(id => data.get(id))

  const options: { [key: string]: () => void } = {
    remove() {
      Collections.states.send("REMOVE_EVENT", {
        id: state.id,
        eventId: event.id
      })
    },
    duplicate() {
      Collections.states.send("DUPLICATE_EVENT", {
        id: state.id,
        eventId: event.id
      })
    }
  }

  if (index > 0) {
    options["move down"] = () =>
      Collections.states.send("MOVE_EVENT", {
        id: state.id,
        eventId: event.id,
        target: index - 1
      })
  }

  if (index < state.events.length - 1) {
    options["move up"] = () =>
      Collections.states.send("MOVE_EVENT", {
        id: state.id,
        eventId: event.id,
        target: index + 1
      })
  }

  return (
    <DraggableItem
      key={event.id}
      draggable={state.events.length > 1}
      draggableId={event.id}
      draggableIndex={index + 1}
      // title={`${event.id} - ${event.name}`}
      title={event.name}
      onCreate={() =>
        Collections.events.send("CREATE_HANDLER", { eventId: event.id })
      }
      options={options}
    >
      <DragList
        id="handlers"
        onDragEnd={result => {
          result.destination &&
            Collections.events.send("MOVE_HANDLER", {
              eventId: event.id,
              handlerId: result.draggableId,
              target: result.destination.index - 1
            })
        }}
      >
        {compact(handlers).map((handler, index) => {
          return (
            <Handler
              key={handler.id}
              event={event}
              handler={handler}
              index={index}
            />
          )
        })}
      </DragList>
    </DraggableItem>
  )
}
