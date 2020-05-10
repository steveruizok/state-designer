import * as React from "react"
import { S } from "@state-designer/core"
import { EventHandler } from "./EventHandler"
import { EventFn } from "./EventFn"
import { useStateDesigner } from "@state-designer/react"

import { Styled } from "theme-ui"
import { Flex, IconButton, Heading, Card, Grid } from "@theme-ui/components"

export const State: React.FC<{ state: S.State<any>; initial: boolean }> = ({
  state,
}) => {
  const eventHandlers = Object.entries(state.on)

  const states = Object.values(state.states)

  const hasStates = states.length > 0

  const hasAutoEvents =
    state.onEvent ||
    state.onEnter ||
    state.onExit ||
    state.repeat ||
    state.async

  const hasOnEvents = eventHandlers.length > 0

  const hasEvents = hasAutoEvents || hasOnEvents

  const { data, send, whenIn, isIn } = useStateDesigner({
    initial: "expanded",
    states: {
      expanded: { on: { TOGGLE: { to: "collapsed" } } },
      collapsed: { on: { TOGGLE: { to: "expanded" } } },
    },
  })

  return (
    <Card
      variant="state"
      sx={{
        border: state.active ? "1px solid #fff" : "1px solid transparent",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#000",
        }}
      >
        <Heading variant="state.name">{state.name}</Heading>
        <IconButton sx={{ width: 64 }} onClick={() => send("TOGGLE")}>
          {whenIn({
            collapsed: "expand",
            expanded: "collapse",
          })}
        </IconButton>
      </Flex>

      {isIn("expanded") && (
        <Grid
          columns={hasStates && hasEvents ? ["auto auto"] : ["auto"]}
          gap={2}
        >
          {hasEvents && (
            <Card variant="events">
              {hasAutoEvents && (
                <Heading variant={"state.section"}>Auto Events</Heading>
              )}
              <Styled.ul>
                {state.onEnter && (
                  <Styled.li>
                    <EventHandler
                      title="onEnter"
                      eventHandler={state.onEnter}
                    />
                  </Styled.li>
                )}
                {state.onExit && (
                  <Styled.li>
                    <EventHandler title="onExit" eventHandler={state.onExit} />
                  </Styled.li>
                )}
                {state.repeat && (
                  <Styled.li>
                    <EventHandler
                      title="repeat"
                      eventHandler={state.repeat.event}
                    >
                      <Card variant="eventFns">
                        <Styled.pre>delay</Styled.pre>
                        {state.repeat.delay.name === "delay" ? (
                          <EventFn
                            eventFn={state.repeat.delay}
                            showName={false}
                          />
                        ) : (
                          <Styled.pre>{state.repeat.delay.name}</Styled.pre>
                        )}
                      </Card>
                    </EventHandler>
                  </Styled.li>
                )}

                {hasOnEvents && (
                  <Heading variant={"state.section"}>Events</Heading>
                )}
                {eventHandlers.map(([eventName, eventHandler], i) => (
                  <Styled.li key={i}>
                    <EventHandler
                      title={eventName}
                      eventHandler={eventHandler}
                    />
                  </Styled.li>
                ))}
              </Styled.ul>
            </Card>
          )}

          {states.length > 0 && (
            <Card variant="states">
              <Heading variant={"state.section"}>States</Heading>
              <Styled.ul>
                {Object.values(state.states).map((child, i) => (
                  <Styled.li key={i}>
                    <State
                      state={child}
                      initial={
                        state.initial === undefined
                          ? true
                          : child.name === state.initial
                      }
                    />
                  </Styled.li>
                ))}
              </Styled.ul>
            </Card>
          )}
        </Grid>
      )}
    </Card>
  )
}
