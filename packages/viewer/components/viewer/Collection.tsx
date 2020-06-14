import * as React from "react"
import { S } from "@state-designer/core"
import { EventFn } from "./EventFn"

export const Collection: React.FC<{
  name: string
  collection: Record<string, S.EventFn<unknown, any>>
}> = ({ name, collection }) => {
  const items = Object.values(collection)
  return (
    <div>
      <h4>{name}</h4>
      <ul>
        {items.map((eventFn, i) => (
          <li>
            <EventFn eventFn={eventFn} />
          </li>
        ))}
      </ul>
    </div>
  )
}
