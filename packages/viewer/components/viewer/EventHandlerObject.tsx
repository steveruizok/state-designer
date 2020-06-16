import * as React from "react"
import { S } from "@state-designer/core"
import { EventFns } from "./EventFns"
import { EventFn } from "./EventFn"

import { Styled } from "theme-ui"
import { Card } from "@theme-ui/components"

export const EventHandlerObject: React.FC<{
  item: S.EventHandlerObject<any>
}> = ({ item }) => {
  return (
    <Card variant="EventHandlerObject">
      {item.get.length > 0 && <EventFns title="get" eventFns={item.get} />}
      {item.if.length > 0 && <EventFns title="if" eventFns={item.if} />}
      {item.unless.length > 0 && (
        <EventFns title="unless" eventFns={item.unless} />
      )}
      {item.ifAny.length > 0 && (
        <EventFns title="ifAny" eventFns={item.ifAny} />
      )}
      {item.do.length > 0 && <EventFns title="do" eventFns={item.do} />}
      {item.to.length > 0 && (
        <Card variant="eventFns">
          <Styled.pre>to</Styled.pre>
          {item.to.map((t) =>
            t.name === "to" ? (
              <EventFn eventFn={t} showName={false} />
            ) : (
              <Styled.pre>{t.name}</Styled.pre>
            )
          )}
        </Card>
      )}
      {item.wait && (
        <Card variant="eventFns">
          <Styled.pre>wait</Styled.pre>
          {item.wait.name === "to" ? (
            <EventFn eventFn={item.wait} showName={false} />
          ) : (
            <Styled.pre>{item.wait.name}</Styled.pre>
          )}
        </Card>
      )}
    </Card>
  )
}
