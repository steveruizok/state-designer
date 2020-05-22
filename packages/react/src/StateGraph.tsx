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

  return (
    <ul className="list event">
      {getEvents(state).map((eventName, i) => (
        <li key={i} className="item event">
          {eventName}
        </li>
      ))}
    </ul>
  )
}

const StateNode: React.FC<{
  state: S.State<any>
}> = ({ state }) => {
  const states = Object.values(state.states)
  return (
    <li data-active={state.active} className="item state">
      {state.name}
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
    state: S.StateDesigner<any, any, any, any, any, any, any>
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
