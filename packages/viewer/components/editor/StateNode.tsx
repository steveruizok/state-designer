// @refresh reset
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState, { State } from "./state"
import {
  SectionHeader,
  CreateRow,
  InputRow,
  SelectRow,
  ListRow,
  Row,
} from "./shared"
import { Handler } from "./Handler"
import { Styled, Box, Select, Radio, Label } from "theme-ui"

export const StateNode: React.FC<{ node: State }> = ({ node }) => {
  const global = useStateDesigner(globalState)
  const childStates = Array.from(node.states.values())

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey",
        p: 3,
        mb: 3,
        borderRadius: 4,
        position: "relative",
        bg: "rgba(255, 255, 255, .01)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "16px",
          width: "16px",
          borderTop: "8px solid",
          borderLeft: "8px solid",
          borderColor: "text",
          borderRight: "8px solid transparent",
          borderBottom: "8px solid transparent",
        }}
      />
      {/* Name */}
      <InputRow
        label="Name"
        defaultValue={node.name}
        readOnly={node.id === "root"}
        onDelete={() => globalState.send("DELETED_STATE", node.id)}
        onSubmit={(name) =>
          globalState.send("UPDATED_STATE_NAME", {
            ...node,
            name,
          })
        }
      />
      {/* Events Handlers */}
      <SectionHeader>Event Handlers</SectionHeader>
      <SelectRow
        options={global.values.events
          .filter((event) => !node.eventHandlers.has(event.id))
          .map((event) => ({ label: event.name, value: event.id }))}
        defaultValue={null}
        onSubmit={(id) => {
          globalState.send("ADDED_EVENT_HANDLER_TO_STATE", {
            stateId: node.id,
            eventId: id,
          })
        }}
      />
      <ListRow>
        {Array.from(node.eventHandlers.values()).map((handler) => (
          <Handler key={handler.id} handler={handler} node={node} />
        ))}
      </ListRow>
      {/* States */}
      <SectionHeader>States</SectionHeader>
      <CreateRow
        defaultValue=""
        placeholder="Create State"
        onSubmit={(name) =>
          global.send("CREATED_STATE", { stateId: node.id, name })
        }
      />

      {node.states.size > 0 && (
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
            {childStates.map((initialId) => (
              <Label key={initialId} mb={1}>
                <Radio
                  name={`${node.id}_initialState`}
                  value={initialId}
                  checked={node.initial === initialId}
                  onChange={() =>
                    globalState.send("SET_INITIAL_STATE_ON_STATE", {
                      stateId: node.id,
                      initialId,
                    })
                  }
                ></Radio>
                {global.data.states.get(initialId)?.name}
              </Label>
            ))}
          </form>
        </Box>
      )}
      <Styled.ul>
        {childStates.map((stateId) => (
          <StateNode key={stateId} node={global.data.states.get(stateId)} />
        ))}
      </Styled.ul>
    </Box>
  )
}
