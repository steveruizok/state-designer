// @refresh reset
import * as React from "react"
import { replace } from "lodash"
import { X, Save, Plus, Delete } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import globalState, { Event } from "./state"

import {
  Styled,
  Heading,
  Box,
  IconButton,
  Input,
  Flex,
  Grid,
  Card,
} from "theme-ui"

export const EventsList: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)
  const local = useStateDesigner({
    id: "events list",
    data: {
      value: "",
    },
    on: {
      CHANGED_VALUE: "setValue",
      ADDED_EVENT: {
        unless: "valueIsEmpty",
        do: ["sendNewEvent", "resetValue"],
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
      sendNewEvent(data) {
        global.send("ADDED_EVENT", data.value)
      },
    },
  })

  return (
    <Grid gap={2}>
      <Heading>Events List</Heading>
      <Row>
        <Input
          value={local.data.value}
          onKeyPress={(e) => e.key === "Enter" && local.send("ADDED_EVENT")}
          onChange={(e) => local.send("CHANGED_VALUE", e.target.value)}
        />
        <IconButton onClick={() => local.send("ADDED_EVENT")}>
          <Plus />
        </IconButton>
      </Row>
      <Styled.ul>
        {Array.from(global.data.events.values()).map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </Styled.ul>
    </Grid>
  )
}

const EventItem: React.FC<{ event: Event }> = ({ event }) => {
  const state = useStateDesigner(
    {
      id: "event item",
      data: {
        value: event.name,
      },
      initial: "idle",
      states: {
        idle: {
          on: {
            FOCUSED: { to: "editing" },
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
        valueMatchesOriginal(data, payload) {
          return data.value === event.name
        },
      },
      actions: {
        setValue(data, payload) {
          data.value = replace(payload, " ", "_").toUpperCase()
        },
        resetValue(data) {
          data.value = event.name
        },
        updateEventInGlobalState(data) {
          globalState.send("UPDATED_EVENT_NAME", {
            ...event,
            name: data.value,
          })
        },
      },
    },
    [event]
  )

  return (
    <Styled.li>
      <Row>
        <Input
          onFocus={() => state.send("FOCUSED")}
          onBlur={() => state.send("BLURRED")}
          value={state.data.value}
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
        <IconButton onClick={() => globalState.send("DELETED_EVENT", event.id)}>
          <Delete />
        </IconButton>
      </Row>
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
