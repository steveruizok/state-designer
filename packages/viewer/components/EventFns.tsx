import * as React from "react"
import { S } from "@state-designer/core"
import { EventFn } from "./EventFn"

import { Styled } from "theme-ui"
import { Card } from "@theme-ui/components"

export const EventFns: React.FC<{
  eventFns: S.EventFn<any, any>[]
  title: string
}> = ({ title, eventFns }) => {
  return (
    <Card variant="eventFns">
      <Styled.pre>{title}</Styled.pre>
      {eventFns.length > 1 ? (
        <Styled.ul>
          {eventFns.map((eventFn, i) => (
            <Styled.li key={i}>
              <EventFn eventFn={eventFn} />
            </Styled.li>
          ))}
        </Styled.ul>
      ) : (
        <EventFn eventFn={eventFns[0]} />
      )}
    </Card>
  )
}
