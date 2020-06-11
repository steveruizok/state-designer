// @refresh reset
import * as React from "react"
import { Delete } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import globalState, { TransitionType, State, EventHandler } from "./state"
import { Flex, Label, Radio, Styled, Select, IconButton, Grid } from "theme-ui"
import { SelectRow } from "./shared"

export const Handler: React.FC<{ handler: EventHandler; node: State }> = ({
  node,
  handler,
}) => {
  const global = useStateDesigner(globalState)
  const event = global.data.events.get(handler.event)
  const targets = global.values.states.filter(
    ({ id }) => ![node.id, "root"].includes(id)
  )

  return (
    <Styled.li>
      <Grid sx={{ border: "1px solid #ccc", p: 2 }}>
        <Grid
          columns={"min-content auto 44px"}
          gap={2}
          sx={{ alignItems: "center" }}
        >
          <div>On:</div>
          <Select
            defaultValue={event.id}
            onChange={(e) => {
              globalState.send("CHANGED_EVENT_HANDLER_ON_STATE", {
                stateId: node.id,
                fromId: event.id,
                toId: e.target.value,
              })
            }}
          >
            {global.values.events
              .map((event) => ({
                label: event.name,
                value: event.id,
              }))
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </Select>
          <IconButton
            onClick={() => {
              globalState.send("DELETED_EVENT_HANDLER_FROM_STATE", {
                stateId: node.id,
                eventId: handler.event,
              })
            }}
          >
            <Delete />
          </IconButton>
        </Grid>
        <Grid
          columns={"min-content auto 44px"}
          gap={2}
          sx={{ alignItems: "center" }}
        >
          <div>To: </div>
          <Select
            defaultValue={handler.to}
            onChange={(e) => {
              globalState.send("SET_EVENT_HANDLER_TARGET", {
                stateId: node.id,
                eventId: event.id,
                targetId: e.target.value,
              })
            }}
          >
            <option></option>
            {targets
              .map((state) => ({
                label: state.name,
                value: state.id,
              }))
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </Select>
        </Grid>
        <form>
          <Flex mb={2}>
            {Object.values(TransitionType).map((type) => (
              <Label key={type} my={1}>
                <Radio
                  name={`${handler.id}_transition_type`}
                  value={type}
                  checked={handler.transitionType === type}
                  onChange={() =>
                    globalState.send("SET_HANDLER_TRANSITION_TYPE", {
                      stateId: node.id,
                      eventId: event.id,
                      type,
                    })
                  }
                ></Radio>
                {type}
              </Label>
            ))}
          </Flex>
        </form>
      </Grid>
    </Styled.li>
  )
}
