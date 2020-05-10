import * as React from "react"
import { S } from "@state-designer/core"
import { EventFns } from "./EventFns"
import { EventFn } from "./EventFn"

import { Styled } from "theme-ui"
import { Card } from "@theme-ui/components"

export const EventHandlerItem: React.FC<{
  item: S.EventHandlerItem<any>
}> = ({ item }) => {
  return (
    <Card variant="eventHandlerItem">
      {item.get.length > 0 && <EventFns title="get" eventFns={item.get} />}
      {item.if.length > 0 && <EventFns title="if" eventFns={item.if} />}
      {item.unless.length > 0 && (
        <EventFns title="unless" eventFns={item.unless} />
      )}
      {item.ifAny.length > 0 && (
        <EventFns title="ifAny" eventFns={item.ifAny} />
      )}
      {item.do.length > 0 && <EventFns title="do" eventFns={item.do} />}
      {item.elseDo.length > 0 && (
        <EventFns title="elseDo" eventFns={item.elseDo} />
      )}
      {item.to && (
        <Card variant="eventFns">
          <Styled.pre>to</Styled.pre>
          {item.to.name === "to" ? (
            <EventFn eventFn={item.to} showName={false} />
          ) : (
            <Styled.pre>{item.to.name}</Styled.pre>
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
