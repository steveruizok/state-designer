import * as React from "react"
import { S } from "@state-designer/core"
import { EventHandlerObject } from "./EventHandlerObject"

import { Styled } from "theme-ui"
import { Card, Heading } from "@theme-ui/components"

export const EventHandler: React.FC<{
  eventHandler: S.EventHandler<any>
  title: string
}> = ({ title, eventHandler, children }) => {
  return (
    <Card variant="eventHandler">
      <Heading variant={"event.name"}>{title}</Heading>
      {eventHandler.length > 1 ? (
        <Styled.ul>
          {eventHandler.map((item, i) => (
            <Styled.li key={i}>
              <EventHandlerObject item={item} />
            </Styled.li>
          ))}
        </Styled.ul>
      ) : (
        <EventHandlerObject item={eventHandler[0]} />
      )}
      {children}
    </Card>
  )
}
