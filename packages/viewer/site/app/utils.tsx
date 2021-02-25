import { S } from "@state-designer/react"

export function getFlatStates(state: S.State<any, any>): S.State<any, any>[] {
  return [state].concat(...Object.values(state.states).map(getFlatStates))
}

export function getAllEvents(state: S.State<any, any>): string[][] {
  const localEvents: string[][] = []

  localEvents.push(...Object.keys(state.on).map((k) => [state.name, k]))

  for (let child of Object.values(state.states)) {
    localEvents.push(...getAllEvents(child))
  }

  return localEvents
}

export function getEventsByState(events: string[][]): [string, string[]][] {
  const dict: Record<string, string[]> = {}

  for (let [stateName, event] of events) {
    const prior = dict[event]
    if (prior === undefined) {
      dict[event] = [stateName]
    } else {
      dict[event].push(stateName)
    }
  }

  return Object.entries(dict)
}
