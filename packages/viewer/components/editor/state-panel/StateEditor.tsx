// @refresh reset
import * as React from "react"
import { sortBy } from "lodash"
import { Plus } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import globalState from "../state"
import * as T from "../types"
import { SelectOptionHeader } from "../shared"
import { PanelSelectItem } from "../panel/PanelSelectItem"
import { Styled, Box, IconButton, Select } from "theme-ui"
import { Panel } from "../panel/Panel"
import { PanelItem } from "../panel/PanelItem"
import { PanelHeading } from "../panel/PanelHeading"
import { StateNode } from "./StateNode"

export const StateEditor: React.FC<{ node: T.StateNode }> = ({ node }) => {
  const global = useStateDesigner(globalState)

  const eventsToAdd = global.values.events.filter(
    (event) => !node.eventHandlers.has(event.id)
  )

  const eventHandlers = sortBy(getValues(node.eventHandlers), "index")

  const childNodes = getValues(node.states).map((id) =>
    global.data.states.get(id)
  )

  return (
    <Panel>
      <Box sx={{ p: 3 }}>
        <StateNode node={node} />
      </Box>
      <PanelHeading title={node.name} />
      <PanelHeading as="h4" title="Event Handlers">
        <CreateEventHandlerButton id={node.id} eventsToAdd={eventsToAdd} />
      </PanelHeading>

      <Styled.ul>
        {eventHandlers.map((handler) => {
          const event = global.data.events.get(handler.event)
          const isFirst = handler.index === 0
          const isLast = handler.index === eventHandlers.length - 1
          return (
            <Box key={handler.id}>
              <PanelSelectItem
                value={event.id}
                onChange={(id) =>
                  globalState.send("CHANGED_EVENT_HANDLER", {
                    stateId: node.id,
                    eventId: event.id,
                    id,
                  })
                }
                menuOptions={{
                  title: "On " + event.name,
                  functions: {
                    "Move Up": isFirst
                      ? null
                      : () =>
                          globalState.send("MOVED_EVENT_HANDLER", {
                            stateId: node.id,
                            eventId: handler.event,
                            delta: -1,
                          }),
                    "Move Down": isLast
                      ? null
                      : () =>
                          globalState.send("MOVED_EVENT_HANDLER", {
                            stateId: node.id,
                            eventId: handler.event,
                            delta: 1,
                          }),
                    "–": null,
                    Delete: () =>
                      globalState.send("DELETED_EVENT_HANDLER_FROM_STATE", {
                        stateId: node.id,
                        eventId: handler.event,
                      }),
                  },
                }}
              >
                {global.values.events.map((event) => (
                  <option
                    key={event.id}
                    disabled={node.eventHandlers.has(event.id)}
                    value={event.id}
                  >
                    {event.name}
                  </option>
                ))}
              </PanelSelectItem>
              {sortBy(getValues(handler.chain), "index").map((link) => (
                <Box key={link.id}>
                  <Box
                    sx={{
                      display: "grid",
                      alignItems: "center",
                      gridTemplateColumns: "auto 1fr",
                    }}
                  >
                    <div>If: </div>
                    <Box>
                      <Select>
                        <option value="">Add Action</option>
                      </Select>
                    </Box>
                    {link.if.map((id, i) => {
                      const isFirst = i === 0
                      const isLast = i === link.if.length - 1

                      return (
                        <Box key={id} sx={{ gridColumn: 2 }}>
                          <PanelSelectItem
                            value={id}
                            onChange={() =>
                              globalState.send("CHANGED_EVENT_HANDLER", {
                                stateId: node.id,
                                eventId: event.id,
                                id,
                              })
                            }
                            menuOptions={{
                              title: "On " + event.name,
                              functions: {
                                "Move Up": isFirst
                                  ? null
                                  : () =>
                                      globalState.send("MOVED_EVENT_HANDLER", {
                                        stateId: node.id,
                                        eventId: handler.event,
                                        delta: -1,
                                      }),
                                "Move Down": isLast
                                  ? null
                                  : () =>
                                      globalState.send("MOVED_EVENT_HANDLER", {
                                        stateId: node.id,
                                        eventId: handler.event,
                                        delta: 1,
                                      }),
                                "–": null,
                                Delete: () =>
                                  globalState.send(
                                    "DELETED_EVENT_HANDLER_FROM_STATE",
                                    {
                                      stateId: node.id,
                                      eventId: handler.event,
                                    }
                                  ),
                              },
                            }}
                          >
                            {global.values.actions.map((action) => (
                              <option key={action.id}>{action.name}</option>
                            ))}
                          </PanelSelectItem>
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          )
        })}
      </Styled.ul>
    </Panel>
  )
}

const CreateEventHandlerButton: React.FC<{
  id: string
  eventsToAdd: T.SendEvent[]
}> = ({ id, eventsToAdd }) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: 32,
        height: 32,
        cursor: "pointer",
      }}
    >
      <IconButton
        sx={{
          height: "100%",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <Plus />
      </IconButton>
      <select
        style={{
          opacity: 0,
          cursor: "pointer",
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
        }}
        disabled={eventsToAdd.length === 0}
        value=""
        onChange={(e) => {
          globalState.send("ADDED_EVENT_HANDLER_TO_STATE", {
            stateId: id,
            eventId: e.target.value,
          })
        }}
      >
        <SelectOptionHeader>Add Event Handler</SelectOptionHeader>
        {eventsToAdd.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>
    </Box>
  )
}

export function getValues<T>(source: Map<string, T> | Set<T>) {
  return Array.from(source.values())
}
