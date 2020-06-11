// @refresh reset
import * as React from "react"
import { replace } from "lodash"
import { X, Save, Plus, Delete } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import globalState, { Event } from "./state"
import { Column, CreateRow, InputRow } from "./shared"
import {
  Styled,
  Heading,
  Button,
  IconButton,
  Input,
  Flex,
  Grid,
  Card,
} from "theme-ui"

export const Lists: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)

  return (
    <Column>
      <Heading>Events List</Heading>
      <CreateRow
        defaultValue=""
        placeholder="Create Event"
        format={(name) => replace(name, " ", "_").toUpperCase()}
        onSubmit={(name) => global.send("ADDED_EVENT", name)}
      />

      <Styled.ul>
        {Array.from(global.data.events.values()).map((event) => (
          <InputRow
            key={event.id}
            defaultValue={event.name}
            onDelete={() => globalState.send("DELETED_EVENT", event.id)}
            onSubmit={(name) =>
              globalState.send("UPDATED_EVENT_NAME", {
                ...event,
                name,
              })
            }
          />
        ))}
      </Styled.ul>

      <Heading>States List</Heading>
      <Styled.ul>
        {global.values.states.map((node) => (
          <Styled.li key={node.id}>
            <Button
              sx={{ bg: "muted" }}
              onClick={() => global.send("SELECTED_STATE", node.id)}
            >
              {node.name}
            </Button>
          </Styled.li>
        ))}
      </Styled.ul>
    </Column>
  )
}
