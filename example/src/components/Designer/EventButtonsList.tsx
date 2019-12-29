import React from "react"
import { Button } from "./Inputs"
import { List } from "./List"

export const EventButtonsList: React.FC<{
  events: any
  onClick: (name: string) => void
}> = ({ events, onClick }) => {
  return (
    <List>
      {events.map((event: any, index: number) => (
        <Button key={index} onClick={() => onClick(event.name)}>
          {event.name}
        </Button>
      ))}
    </List>
  )
}
