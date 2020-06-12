// @refresh reset
import { sortBy } from "lodash"
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState, {
  TransitionType,
  State,
  EventHandler,
  HandlerLink,
} from "./state"
import { DragHandle } from "./shared"
import { Segment } from "./Segment"
import { Box, Divider, Card, Select, Grid } from "theme-ui"

export const EventHandlerLink: React.FC<{
  link: HandlerLink
  handler: EventHandler
  node: State
}> = ({ node, handler, link }) => {
  const global = useStateDesigner(globalState)
  const event = global.data.events.get(handler.event)
  const targets = global.values.states.filter(
    ({ id }) => ![node.id, "root"].includes(id)
  )

  return (
    <Card variant="editor.link">
      <DragHandle>
        <select
          style={{
            opacity: 0,
            height: 20,
            width: 20,
            cursor: "pointer",
          }}
          value={""}
          onChange={(e) => {
            switch (e.target.value) {
              case "move up": {
                globalState.send("MOVED_LINK", {
                  stateId: node.id,
                  eventId: handler.event,
                  linkId: link.id,
                  delta: -1,
                })
                break
              }
              case "move down": {
                globalState.send("MOVED_LINK", {
                  stateId: node.id,
                  eventId: handler.event,
                  linkId: link.id,
                  delta: 1,
                })
                break
              }
              case "delete": {
                globalState.send("DELETED_LINK", {
                  stateId: node.id,
                  eventId: handler.event,
                  linkId: link.id,
                })
                break
              }
            }
          }}
        >
          <option></option>
          {link.index > 0 && <option value="move up">Move Up</option>}
          {link.index < handler.chain.size - 1 && (
            <option value="move down">Move Down</option>
          )}
          <option value="delete">Delete</option>
        </select>
      </DragHandle>
      <Grid columns={"40px auto"} gap={2} sx={{ alignItems: "center" }}>
        <div>To: </div>
        <Select
          defaultValue={link.to}
          onChange={(e) => {
            globalState.send("SET_LINK_TRANSITION_TARGET", {
              stateId: node.id,
              eventId: event.id,
              linkId: link.id,
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
        {link.to && (
          <Segment
            sx={{ gridColumn: 2 }}
            value={link.transitionType}
            options={Object.values(TransitionType)}
            onChange={(type) =>
              globalState.send("SET_LINK_TRANSITION_TYPE", {
                stateId: node.id,
                eventId: event.id,
                linkId: link.id,
                type,
              })
            }
          />
        )}
      </Grid>
      <Divider />
      <Grid columns={"40px auto"} gap={2} sx={{ alignItems: "center" }}>
        Do:
        {link.do.map((actionId, index) => (
          <ActionSelect
            key={index}
            value={actionId}
            placeholder="Remove Action"
            onChange={(toId) =>
              globalState.send("CHANGED_LINK_ACTION", {
                stateId: node.id,
                eventId: event.id,
                linkId: link.id,
                index,
                toId,
              })
            }
          />
        ))}
        <ActionSelect
          value=""
          placeholder="Add Action"
          onChange={(actionId) =>
            globalState.send("ADDED_LINK_ACTION", {
              stateId: node.id,
              eventId: event.id,
              linkId: link.id,
              actionId,
            })
          }
        />
      </Grid>
    </Card>
  )
}

const ActionSelect: React.FC<{
  value?: string
  onChange: (actionId: string) => void
  placeholder: string
}> = ({ value, placeholder, onChange }) => {
  const global = useStateDesigner(globalState)
  return (
    <Box sx={{ gridColumn: 2 }}>
      <Select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        <option disabled>──────────</option>
        {sortBy(Array.from(global.data.actions.values()), "index").map(
          (action) => (
            <option key={action.id} value={action.id}>
              {action.name}
            </option>
          )
        )}
      </Select>
    </Box>
  )
}
