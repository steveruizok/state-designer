// @refresh reset
import * as React from "react"
import { replace } from "lodash"
import { X, Save, Plus, Delete } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import globalState, { State } from "./state"

import {
  Styled,
  Heading,
  Select,
  IconButton,
  Input,
  Flex,
  Grid,
  Card,
} from "theme-ui"

export const StatesList: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)

  const local = useStateDesigner({
    id: "states list",
    data: {
      value: "",
    },
    on: {
      CHANGED_VALUE: "setValue",
      ADDED_STATE: {
        unless: "valueIsEmpty",
        do: ["sendNewState", "resetValue"],
      },
    },
    conditions: {
      valueIsEmpty(data) {
        return data.value === ""
      },
    },
    actions: {
      resetValue(data) {
        data.value = ""
      },
      setValue(data, payload) {
        data.value = replace(payload, " ", "_").toUpperCase()
      },
      sendNewState(data) {
        global.send("ADDED_STATE", data.value)
      },
    },
  })

  return (
    <Grid gap={2}>
      <Heading>States List</Heading>
      <Row>
        <Input
          value={local.data.value}
          onKeyPress={(e) => e.key === "Enter" && local.send("ADDED_STATE")}
          onChange={(e) => local.send("CHANGED_VALUE", e.target.value)}
        />
        <IconButton onClick={() => local.send("ADDED_STATE")}>
          <Plus />
        </IconButton>
      </Row>
      <Styled.ul>
        {global.values.states.map((node) => (
          <StateItem key={node.id} node={node} />
        ))}
      </Styled.ul>
    </Grid>
  )
}

const StateItem: React.FC<{ node: State }> = ({ node }) => {
  const global = useStateDesigner(globalState)
  const state = useStateDesigner(
    {
      id: "state item",
      data: {
        value: node.name,
        eventToAdd: undefined as string | undefined,
      },
      initial: "idle",
      states: {
        idle: {
          on: {
            FOCUSED: { to: "editing" },
            SELECTED_EVENT: { do: "selectEvent" },
            ADDED_EVENT_HANDLER: { if: "hasEventToAdd", do: "addEventHandler" },
            REMOVED_EVENT_HANDLER: { do: "removeEventHandler" },
          },
        },
        editing: {
          initial: "same",
          states: {
            same: {
              on: {
                BLURRED: { to: "idle" },
                CHANGED_VALUE: {
                  unless: "valueMatchesOriginal",
                  to: "changed",
                },
              },
            },
            changed: {
              on: {
                CHANGED_VALUE: {
                  if: "valueMatchesOriginal",
                  to: "same",
                },
                SAVED_VALUE: "updateEventInGlobalState",
              },
            },
          },
          on: {
            CHANGED_VALUE: "setValue",
            CANCELLED: { do: "resetValue", to: "idle" },
          },
        },
      },
      on: {},
      conditions: {
        hasEventToAdd(data) {
          return data.eventToAdd !== undefined
        },
        valueMatchesOriginal(data) {
          return data.value === node.name
        },
      },
      actions: {
        selectEvent(data, eventId) {
          data.eventToAdd = eventId
        },
        addEventHandler(data) {
          const id = data.eventToAdd

          globalState.send("ADDED_EVENT_HANDLER_TO_STATE", {
            stateId: node.id,
            eventId: id,
          })

          data.eventToAdd = undefined
        },
        removeEventHandler(data, eventId) {
          globalState.send("DELETED_EVENT_HANDLER_FROM_STATE", {
            stateId: node.id,
            eventId,
          })
        },
        setValue(data, value) {
          data.value = replace(value, " ", "_").toUpperCase()
        },
        resetValue(data) {
          data.value = node.name
        },
        updateEventInGlobalState(data) {
          globalState.send("UPDATED_STATE_NAME", {
            ...node,
            name: data.value,
          })
        },
      },
      values: {},
    },
    [node]
  )

  const eventsToAdd = global.values.events.filter(
    (event) => !node.eventHandlers.has(event.id)
  )

  return (
    <Styled.li>
      <Grid gap={2} sx={{ border: "1px solid #ccc", p: 2 }}>
        Name
        <Row>
          <Input
            value={state.data.value}
            onBlur={() => state.send("BLURRED")}
            onFocus={() => state.send("FOCUSED")}
            onKeyPress={(e) => e.key === "Enter" && state.send("SAVED_VALUE")}
            onChange={(e) => state.send("CHANGED_VALUE", e.target.value)}
          />
          {state.isIn("editing") && (
            <>
              <IconButton
                disabled={!state.isIn("changed")}
                onClick={() => state.send("SAVED_VALUE")}
              >
                <Save />
              </IconButton>
              <IconButton onClick={() => state.send("CANCELLED")}>
                <X />
              </IconButton>
            </>
          )}
          <IconButton
            onClick={() => globalState.send("DELETED_STATE", node.id)}
          >
            <Delete />
          </IconButton>
        </Row>
        Events
        <Row>
          <ul>
            {node.eventHandlers.size === 0 ? (
              <li>None</li>
            ) : (
              Array.from(node.eventHandlers.values()).map((handler) => (
                <li key={handler.id}>
                  <Row>
                    {global.data.events.get(handler.event)?.name}
                    <IconButton
                      onClick={() =>
                        state.send("REMOVED_EVENT_HANDLER", handler.event)
                      }
                    >
                      <Delete />
                    </IconButton>
                  </Row>
                </li>
              ))
            )}
          </ul>
        </Row>
        Add Event
        <Row>
          <Select
            onChange={(e) => {
              console.log(e.target.value)
              state.send("SELECTED_EVENT", e.target.value)
            }}
          >
            <option></option>
            {eventsToAdd.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>
          <IconButton onClick={() => state.send("ADDED_EVENT_HANDLER")}>
            <Plus />
          </IconButton>
        </Row>
      </Grid>
    </Styled.li>
  )
}

const Row: React.FC<{}> = (props) => {
  return (
    <Grid
      {...props}
      sx={{
        gridTemplateColumns: "1fr",
        gridAutoColumns: "auto",
        gridAutoFlow: "column",
      }}
      gap={2}
      mb={2}
    />
  )
}

const EventHandler: React.FC<{}> = (props) => {
  return <div />
}
