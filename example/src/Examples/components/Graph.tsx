import React from "react"
import { Styled } from "theme-ui"
import { Card } from "./Card"
import { EventButton } from "./EventButton"
import { Graph as GraphNode } from "state-designer"
import { Flex, Box, Text, Button, Radio } from "@theme-ui/components"

export interface Props {
  send: any
  can: any
  graph: GraphNode
}

export const Graph: React.FC<Props> = ({ graph, can, send, children }) => {
  function onEvent(name: string, payload: any) {
    send(name, payload)
  }

  function canEvent(name: string, payload: any) {
    return can(name, payload)
  }

  return (
    <Box my={5} sx={{ maxWidth: 500 }}>
      <Node {...graph} root onEvent={onEvent} canEvent={canEvent} />
      {children}
    </Box>
  )
}

const Node: React.FC<GraphNode & {
  canEvent: (name: string, payload: any) => boolean
  onEvent: (name: string, payload: any) => void
  root?: boolean
}> = ({
  name,
  initial,
  active,
  events,
  states,
  canEvent,
  onEvent,
  root = false
}) => {
  const hasEvents = events.length > 0
  const hasContent = states || hasEvents

  return (
    <Card
      active={active}
      mr={hasContent ? 5 : 0}
      sx={{
        width: "100%" //root ? "100%" : hasContent ? "fit-content" : "100%"
      }}
    >
      <Flex
        px={3}
        py={2}
        backgroundColor="muted"
        sx={{
          alignItems: "center",
          borderBottom: hasContent
            ? active
              ? "1px solid #ccc"
              : "1px solid #ddd"
            : "none"
        }}
      >
        <Radio checked={active} onChange={() => {}} disabled={true} />
        <Text
          variant="event"
          sx={{
            fontWeight: active ? "600" : "400"
          }}
        >
          {name}
          {initial && "*"}
        </Text>
      </Flex>
      {hasContent && (
        <Box px={4} py={3}>
          {hasEvents && (
            <ListContainer name="Events">
              <Styled.ul>
                {events.map((value, index) => {
                  return (
                    <Styled.li key={index}>
                      <EventButton
                        active={active}
                        value={value}
                        enabled={canEvent}
                        onClick={onEvent}
                      />
                    </Styled.li>
                  )
                })}
              </Styled.ul>
            </ListContainer>
          )}
          {states && (
            <ListContainer name="States">
              <Flex
                pt={1}
                sx={{
                  flexDirection: states.length > 2 ? "column" : "row",
                  alignItems: "flex-start",
                  justifyContent: "flex-start"
                }}
              >
                {states.map((value, index) => {
                  return (
                    <Node
                      key={index}
                      {...value}
                      canEvent={canEvent}
                      onEvent={onEvent}
                    />
                  )
                })}
              </Flex>
            </ListContainer>
          )}
        </Box>
      )}
    </Card>
  )
}

const ListContainer: React.FC<{ name: string }> = ({ name, children }) => {
  return (
    <Box>
      <Text variant="label">{name}</Text>
      {children}
    </Box>
  )
}
