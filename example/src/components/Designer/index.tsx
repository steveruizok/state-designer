import React from "react"
import { Box } from "rebass"
import { StateDesigner, useStateDesigner } from "state-designer"
import {
  getInitialActionListConfig,
  ActionListConfig
} from "./machines/actionList"
import {
  getInitialConditionListConfig,
  ConditionListConfig
} from "./machines/conditionList"
import { eventsListConfig, EventsListConfig } from "./machines/eventsList"
import { NamedFunctionList } from "./NamedFunctionList"
import { Preview } from "./Preview"
import { List } from "./List"
import { EventsList } from "./EventsList"
import * as DS from "./types"
import DragList from "./DragList"

export interface Props {}

export const eventsState = new StateDesigner(eventsListConfig)
export const namedActionsState = new StateDesigner(getInitialActionListConfig())
export const namedConditionsState = new StateDesigner(
  getInitialConditionListConfig()
)

const Designer: React.FC<Props> = ({ children }) => {
  const { data, send } = useStateDesigner({
    data: {
      events: eventsState.data.items.map(item => ({
        id: item.id,
        ...item.item.data
      })),
      namedActions: namedActionsState.data.items.map(item => ({
        id: item.id,
        ...item.item.data.clean
      })),
      namedConditions: namedConditionsState.data.items.map(item => ({
        id: item.id,
        ...item.item.data.clean
      }))
    },
    on: {
      UPDATE_EVENTS: {
        do: "updateEvents"
      },
      UPDATE_NAMED_ACTIONS: {
        do: "updateNamedActions"
      },
      UPDATE_NAMED_CONDITIONS: {
        do: "updateNamedConditions"
      }
    },
    actions: {
      updateEvents: (data, payload: EventsListConfig["data"]) => {
        data.events = payload.items.map(item => ({
          id: item.id,
          ...item.item.data
        }))
      },
      updateNamedActions: (data, payload: ActionListConfig["data"]) => {
        data.namedActions = payload.items.map(item => ({
          id: item.id,
          ...item.item.data.clean
        }))
      },
      updateNamedConditions: (data, payload: ConditionListConfig["data"]) => {
        data.namedConditions = payload.items.map(item => ({
          id: item.id,
          ...item.item.data.clean
        }))
      }
    }
  })

  const captiveMachine = useStateDesigner(
    {
      data: {
        count: 0
      },
      actions: data.namedActions.reduce<any>((acc, item) => {
        acc[item.name] = getSafeFunction(item.code)
        return acc
      }, {}),
      conditions: data.namedConditions.reduce<any>((acc, item) => {
        acc[item.name] = getSafeFunction(item.code)
        return acc
      }, {}),
      on: data.events.reduce<any>((acc, event) => {
        acc[event.clean.name] = event.clean.handlers.map(handler => ({
          do: handler.do.map(d => {
            switch (d.type) {
              case DS.HandlerItems.Custom: {
                return getSafeFunction(d.code)
              }
              case DS.HandlerItems.Named: {
                return d.name
              }
            }
          }),
          if: handler.if.map(d => {
            switch (d.type) {
              case DS.HandlerItems.Custom: {
                return getSafeFunction(d.code)
              }
              case DS.HandlerItems.Named: {
                return d.name
              }
            }
          })
        }))

        return acc
      }, {})
    },
    undefined,
    undefined,
    [data]
  )

  return (
    <Box
      p={3}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, 420px)",
        gap: 3
      }}
    >
      <List>
        <NamedFunctionList
          name="Action"
          state={namedActionsState}
          onChange={(data: ActionListConfig["data"]) =>
            send("UPDATE_NAMED_ACTIONS", data)
          }
        />
        <NamedFunctionList
          name="Condition"
          state={namedConditionsState}
          onChange={(data: ConditionListConfig["data"]) =>
            send("UPDATE_NAMED_CONDITIONS", data)
          }
        />
      </List>
      <Box>
        <EventsList
          state={eventsState}
          actions={data.namedActions}
          conditions={data.namedConditions}
          onChange={(data: EventsListConfig["data"]) =>
            send("UPDATE_EVENTS", data)
          }
        />
      </Box>
      <Box>
        <Preview events={data.events} machine={captiveMachine} />
      </Box>
      {/* <DragList>
        <Box>Hello0</Box>
        <Box>Hello1</Box>
        <Box>Hello2</Box>
      </DragList> */}
    </Box>
  )
}

export default Designer

function getSafeFunction(code?: string) {
  let func: any = function() {}

  try {
    func = Function("data", "payload", "result", code || "")
  } catch (e) {}

  return func
}
