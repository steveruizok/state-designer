import * as React from "react"
import { S } from "@state-designer/core"
import { useStateDesigner } from "./useStateDesigner"

const EventList: React.FC<{
  state: S.State<any>
}> = ({ state }) => {
  function getEvents(state: S.State<any>): string[] {
    const localEvents: string[] = []

    if (state.active) {
      localEvents.push(...Object.keys(state.on))
    }

    for (let child of Object.values(state.states)) {
      localEvents.push(...getEvents(child))
    }

    return localEvents
  }

  const eventMap = new Map<string, number>([])

  for (let event of getEvents(state)) {
    const prior = eventMap.get(event)
    if (prior === undefined) {
      eventMap.set(event, 1)
    } else {
      eventMap.set(event, prior + 1)
    }
  }

  return (
    <ul className="list event">
      {Array.from(eventMap.entries()).map(([eventName, count], i) => (
        <li key={i} className="item event">
          {eventName}
          {count > 1 && ` x${count}`}
        </li>
      ))}
    </ul>
  )
}

const StateNode: React.FC<{
  state: S.State<any>
}> = ({ state }) => {
  const { active } = state
  const states = Object.values(state.states)
  return (
    <li data-active={active} className="item state">
      {active ? <b>{state.name}</b> : state.name}
      {states.length > 0 && (
        <ul className="list state">
          {states.map((child, i) => (
            <StateNode key={i} state={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

export const StateGraph: React.FC<
  {
    state: S.DesignedState<any, any>
  } & React.HTMLProps<HTMLDivElement>
> = ({ state, ...rest }) => {
  const { stateTree } = useStateDesigner(state)

  return (
    <div {...rest}>
      <span className="title states">States:</span>
      <ul>
        <StateNode state={stateTree} />
      </ul>
      <span className="title events">Events:</span>
      <EventList state={stateTree} />
    </div>
  )
}
