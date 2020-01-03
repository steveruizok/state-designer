import React from "react"
import { uniqueId } from "lodash"
import { Flex, Box } from "rebass"
import { StateDesigner, useStateDesigner } from "state-designer"
import { createNamedFunctionConfig } from "./machines/namedFunction"
import {
  createActionListConfig,
  getInitialActionListConfig,
  ActionListConfig
} from "./machines/actionList"
import {
  createConditionListConfig,
  getInitialConditionListConfig,
  ConditionListConfig
} from "./machines/conditionList"
import {
  createEventsListConfig,
  eventsListConfig,
  EventsListConfig
} from "./machines/eventsList"
import { createEventConfig } from "./machines/event"
import { CaptiveData } from "./machines/captiveData"
import { NamedFunctionList } from "./NamedFunctionList"
import { Preview } from "./Preview"
import { List } from "./List"
import { EventsList } from "./EventsList"
import * as DS from "./types"
import { Select } from "@rebass/forms"
import { Item } from "./item/Item"
import { Title } from "./item/Title"

export interface Props {}

let initialData: string
export let eventsState: StateDesigner<EventsListConfig>
export let namedActionsState: StateDesigner<ActionListConfig>
export let namedConditionsState: StateDesigner<ConditionListConfig>

const localData = localStorage.getItem("state_designer_data")

if (localData !== undefined && localData !== null) {
  const data = JSON.parse(localData)

  const configActions = {
    items: data.namedActions.map((item: any) => ({
      id: item.id,
      item: new StateDesigner(
        createNamedFunctionConfig({
          id: item.id,
          editing: false,
          hasChanges: false,
          error: undefined,
          dirty: {
            name: item.name,
            code: item.code,
            mustReturn: false
          },
          clean: {
            name: item.name,
            code: item.code,
            mustReturn: false
          }
        })
      )
    }))
  }

  const configConditions = {
    items: data.namedConditions.map((item: any) => ({
      id: item.id,
      item: new StateDesigner(
        createNamedFunctionConfig({
          id: item.id,
          editing: false,
          hasChanges: false,
          error: undefined,
          dirty: {
            name: item.name,
            code: item.code,
            mustReturn: true
          },
          clean: {
            name: item.name,
            code: item.code,
            mustReturn: true
          }
        })
      )
    }))
  }

  const configEvents = createEventsListConfig({
    items: data.events.map((item: any) => ({
      id: item.id,
      item: new StateDesigner(createEventConfig(item))
    }))
  })

  initialData = data.captiveData
  eventsState = new StateDesigner(configEvents)
  namedActionsState = new StateDesigner(createActionListConfig(configActions))
  namedConditionsState = new StateDesigner(
    createConditionListConfig(configConditions)
  )
} else {
  initialData = "count: 0"
  eventsState = new StateDesigner(eventsListConfig)
  namedActionsState = new StateDesigner(getInitialActionListConfig())
  namedConditionsState = new StateDesigner(getInitialConditionListConfig())
}

const Designer: React.FC<Props> = ({ children }) => {
  const { data, send } = useStateDesigner({
    data: {
      captiveData: initialData,
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
      UPDATE_DATA: {
        do: "updateData"
      },
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
      updateData: (data, payload) => {
        data.captiveData = payload
      },
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

  const [blinks, setBlinks] = React.useState(0)

  const captiveMachine = useStateDesigner(
    {
      data: new Function(`return {${data.captiveData}}`)(),
      actions: data.namedActions.reduce<any>((acc, item) => {
        acc[item.name] = getSafeFunction(item.code)
        return acc
      }, {}),
      conditions: data.namedConditions.reduce<any>((acc, item) => {
        acc[item.name] = getSafeFunction(item.code)
        return acc
      }, {}),
      onEvent: () => {
        setBlinks(blinks => blinks + 1)
      },
      on: {
        _RESET: (d: any) => {
          // Reset captive machine data to (global) machine data
          Object.assign(d, new Function(`return {${data.captiveData}}`)())
        },
        ...data.events.reduce<any>((acc, event) => {
          acc[event.clean.name] = event.clean.handlers.map(handler => ({
            do: handler.do.map(d => {
              switch (d.type) {
                case DS.HandlerItems.Custom: {
                  return getSafeFunction(d.code)
                }
                case DS.HandlerItems.Named: {
                  return d.name
                }
                default: {
                  return
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
                default: {
                  return
                }
              }
            })
          }))

          return acc
        }, {})
      }
    },
    state => {
      // console.log("onEvent fired changed")
      // console.log("current captive data", state.data)
    },
    undefined,
    [data]
  )

  React.useEffect(() => {
    localStorage.setItem("state_designer_data", JSON.stringify(data))
  }, [data])

  return (
    <Box p={3}>
      <Box mb={4}>
        <h1>State Designer</h1>
        <a href="https://github.com/steveruizok/state-designer">Github</a>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridGap: 10,
          gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr) )",
          gridAutoFlow: "row dense"
        }}
      >
        <Preview
          code={data.captiveData}
          onCodeChange={code => send("UPDATE_DATA", code)}
          events={data.events}
          machine={captiveMachine}
          blinkSource={blinks}
        />
        <EventsList
          state={eventsState}
          actions={data.namedActions}
          conditions={data.namedConditions}
          onChange={(data: EventsListConfig["data"]) =>
            send("UPDATE_EVENTS", data)
          }
          onEventFire={(name: string) => captiveMachine.send(name)}
          canEventFire={(name: string) => captiveMachine.can(name)}
        />
        <Box>
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
        </Box>
      </Box>
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
