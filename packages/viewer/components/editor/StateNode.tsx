// @refresh reset
import * as React from "react"
import { sortBy } from "lodash"
import { Plus } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import globalState, { State } from "./state"
import { SelectOptionHeader, CreateRow, InputRow, Row, ListRow } from "./shared"
import { EventHandler } from "./EventHandler"
import { StateListItem } from "./StateListItem"
import {
  Divider,
  Heading,
  Styled,
  Card,
  Box,
  Button,
  Radio,
  IconButton,
  Label,
  Select,
} from "theme-ui"

export const StateNode: React.FC<{ node: State }> = ({ node }) => {
  const global = useStateDesigner(globalState)
  const parentNode = global.data.states.get(node.parent)
  const childNodes = Array.from(node.states.values()).map((id) =>
    global.data.states.get(id)
  )
  const eventsToAdd = global.values.events.filter(
    (event) => !node.eventHandlers.has(event.id)
  )
  const eventHandlers = sortBy(Array.from(node.eventHandlers.values()), "index")

  return (
    <Card variant="editor.state">
      {/* Name */}
      <Heading as={"h3"}>{node.name}</Heading>
      {/* Events Handlers */}
      <Divider mx={-4} />
      <Row>
        <Heading as={"h3"}>Event Handlers</Heading>
        <Box
          sx={{
            position: "relative",
            width: 44,
            height: 36,
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
                stateId: node.id,
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
      </Row>
      <ListRow>
        {eventHandlers.map((handler) => (
          <Styled.li key={handler.id}>
            <EventHandler handler={handler} node={node} />
          </Styled.li>
        ))}
      </ListRow>
      {/* States */}
      <Divider mx={-4} />
      <Heading as="h3">States</Heading>
      <CreateRow
        defaultValue=""
        placeholder="Create State"
        onSubmit={(name) =>
          global.send("CREATED_STATE", { stateId: node.id, name })
        }
      />
      {/* Initial state */}
      {node.states.size > 0 && (
        <InitialStatePicker node={node} childNodes={childNodes} />
      )}
      {/* Links to Edit Child States */}
      <ChildStateNodeLinks childNodes={childNodes} />
    </Card>
  )
}

const InitialStatePicker: React.FC<{ node: State; childNodes: State[] }> = ({
  node,
  childNodes,
}) => {
  return (
    <Box my={3}>
      Initial
      <form>
        <Label mb={1}>
          <Radio
            name={`${node.id}_initialState`}
            value={undefined}
            defaultChecked={node.initial === undefined}
            onChange={() =>
              globalState.send("SET_INITIAL_STATE_ON_STATE", {
                stateId: node.id,
                initialId: undefined,
              })
            }
          ></Radio>
          None (Parallel State)
        </Label>
        {childNodes.map((childNode) => (
          <Label key={childNode.id} mb={1}>
            <Radio
              name={`${node.id}_initialState`}
              value={childNode.id}
              checked={node.initial === childNode.id}
              onChange={() =>
                globalState.send("SET_INITIAL_STATE_ON_STATE", {
                  stateId: node.id,
                  initialId: childNode.id,
                })
              }
            ></Radio>
            {childNode.name}
          </Label>
        ))}
      </form>
    </Box>
  )
}

const ChildStateNodeLinks: React.FC<{ childNodes: State[] }> = ({
  childNodes,
}) => {
  return (
    <Styled.ul>
      {sortBy(childNodes, "index").map((node) => (
        <Styled.li key={node.id}>
          <StateListItem node={node} depth={0} />
        </Styled.li>
      ))}
    </Styled.ul>
  )
}
