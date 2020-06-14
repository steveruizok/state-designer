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
import { Plus } from "react-feather"
import { SelectOptionHeader } from "./shared"
import { DragHandle } from "./shared"
import { Segment } from "./Segment"
import { Box, Divider, Card, Select, Grid, Field } from "theme-ui"

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
  variant?: string
  title?: string
  onChange: (id: string) => void
  placeholder: string
  dim?: boolean
  fns: EventFunction[]
}> = ({
  value,
  dim,
  fns,
  onChange,
  variant = "select",
  title,
  placeholder,
}) => {
  return (
    <Box sx={{ gridColumn: 2 }}>
      <Select
        variant={variant}
        disabled={fns.length === 0}
        value={value || ""}
        sx={{ color: dim ? "active" : "text" }}
        onChange={(e) => onChange(e.target.value)}
      >
        {title && <SelectOptionHeader>{title}</SelectOptionHeader>}
        {placeholder && (
          <>
            <option value="">{placeholder}</option>
            <option disabled>—</option>
          </>
        )}
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
    <Grid columns={"40px auto"} gap={1} sx={{ alignItems: "center" }}>
      If
      {link.if.map((condId, index) => (
        <EventFunctionSelect
          key={index}
          fns={conditions}
          value={condId}
          title="Condition"
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
        variant="create"
        fns={conditions.filter(({ id }) => !link.if.includes(id))}
        value=""
        dim={true}
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

const LinkActions: React.FC<{
  link: HandlerLink
  node: State
  handler: EventHandler
  actions: Action[]
}> = ({ link, node, actions, handler }) => {
  return (
    <Grid columns={"40px auto"} gap={1} sx={{ alignItems: "center" }}>
      Do
      {link.do.map((actionId, index) => (
        <EventFunctionSelect
          key={index}
          value={actionId}
          fns={actions}
          title="Action"
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
        variant="create"
        placeholder="Add Action"
        fns={actions}
        dim={true}
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
  node: State
  handler: EventHandler
  targets: State[]
  link: HandlerLink
}> = ({ link, node, handler, targets }) => {
  return (
    <Grid columns={"40px auto"} gap={1} sx={{ alignItems: "center" }}>
      <div>To</div>
      <Select
        defaultValue={link.to}
        variant={link.to ? "select" : "create"}
        sx={{ color: link.to ? "text" : "active" }}
        onChange={(e) => {
          if (e.target.value === "Remove Target") {
            globalState.send("SET_LINK_TRANSITION_TARGET", {
              stateId: node.id,
              eventId: handler.event,
              linkId: link.id,
              id: undefined,
            })
            return
          }

          globalState.send("SET_LINK_TRANSITION_TARGET", {
            stateId: node.id,
            eventId: handler.event,
            linkId: link.id,
            id: e.target.value,
          })
        }}
      >
        <option>{link.to ? "Remove Target" : "Select Target"}</option>
        <option disabled>—</option>
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
