// @refresh reset
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState, {
  TransitionType,
  State,
  EventHandler,
  HandlerLink,
  EventFunction,
  Action,
  Condition,
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
  const { states, actions, conditions } = global.values
  const targets = states.filter((s) => ![node.id, "root"].includes(s.id))

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
      {/* Conditions */}
      <LinkConditions
        node={node}
        handler={handler}
        link={link}
        conditions={conditions}
      />
      <Divider />
      {/* Actions */}
      <LinkActions
        node={node}
        handler={handler}
        link={link}
        actions={actions}
      />
      <Divider />
      {/* Transition */}
      <LinkTransitions
        node={node}
        handler={handler}
        link={link}
        targets={targets}
      />
    </Card>
  )
}

const EventFunctionSelect: React.FC<{
  value?: string
  onChange: (id: string) => void
  placeholder: string
  fns: EventFunction[]
}> = ({ value, fns, onChange, placeholder }) => {
  return (
    <Box sx={{ gridColumn: 2 }}>
      <Select
        disabled={fns.length === 0}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        <option disabled>──────────</option>
        {fns.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
    </Box>
  )
}

/* ------------------- Conditions ------------------- */

const LinkConditions: React.FC<{
  link: HandlerLink
  node: State
  handler: EventHandler
  conditions: Condition[]
}> = ({ link, node, handler, conditions }) => {
  return (
    <Grid columns={"40px auto"} gap={2} sx={{ alignItems: "center" }}>
      If:
      {link.if.map((condId, index) => (
        <EventFunctionSelect
          key={index}
          fns={conditions}
          value={condId}
          placeholder="Remove Condition"
          onChange={(id) =>
            globalState.send("CHANGED_LINK_CONDITION", {
              stateId: node.id,
              eventId: handler.event,
              linkId: link.id,
              id,
              index,
            })
          }
        />
      ))}
      <EventFunctionSelect
        fns={conditions.filter(({ id }) => !link.if.includes(id))}
        value=""
        placeholder="Add Condition"
        onChange={(id) =>
          globalState.send("ADDED_LINK_CONDITION", {
            stateId: node.id,
            eventId: handler.event,
            linkId: link.id,
            id,
          })
        }
      />
    </Grid>
  )
}

/* --------------------- Actions -------------------- */

const ActionSelect: React.FC<{
  value?: string
  onChange: (actionId: string) => void
  placeholder: string
}> = ({ value, placeholder, onChange }) => {
  const global = useStateDesigner(globalState)
  const fns = global.values.actions
  return (
    <Box sx={{ gridColumn: 2 }}>
      <Select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        <option disabled>──────────</option>
        {fns.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
    </Box>
  )
}

const LinkActions: React.FC<{
  link: HandlerLink
  node: State
  handler: EventHandler
  actions: Action[]
}> = ({ link, node, actions, handler }) => {
  return (
    <Grid columns={"40px auto"} gap={2} sx={{ alignItems: "center" }}>
      Do:
      {link.do.map((actionId, index) => (
        <EventFunctionSelect
          key={index}
          value={actionId}
          fns={actions}
          placeholder="Remove Action"
          onChange={(id) =>
            globalState.send("CHANGED_LINK_ACTION", {
              stateId: node.id,
              eventId: handler.event,
              linkId: link.id,
              index,
              id,
            })
          }
        />
      ))}
      <EventFunctionSelect
        value=""
        placeholder="Add Action"
        fns={actions}
        onChange={(id) =>
          globalState.send("ADDED_LINK_ACTION", {
            stateId: node.id,
            eventId: handler.event,
            linkId: link.id,
            id,
          })
        }
      />
    </Grid>
  )
}

/* ------------------- Transition ------------------- */

const LinkTransitions: React.FC<{
  link: HandlerLink
  node: State
  handler: EventHandler
  targets: State[]
}> = ({ link, node, handler, targets }) => {
  return (
    <Grid columns={"40px auto"} gap={2} sx={{ alignItems: "center" }}>
      <div>To: </div>
      <Select
        defaultValue={link.to}
        onChange={(e) => {
          globalState.send("SET_LINK_TRANSITION_TARGET", {
            stateId: node.id,
            eventId: handler.event,
            linkId: link.id,
            targetId: e.target.value,
          })
        }}
      >
        <option>Select target</option>
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
              eventId: handler.event,
              linkId: link.id,
              type,
            })
          }
        />
      )}
    </Grid>
  )
}
