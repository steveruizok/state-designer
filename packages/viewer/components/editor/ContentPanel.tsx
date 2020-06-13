// @refresh reset
import * as React from "react"
import { replace, sortBy } from "lodash"
import { useStateDesigner } from "@state-designer/react"
import globalState, { State } from "./state"
import { StateListItem } from "./StateListItem"
import { EventOptionsButton } from "./EventOptionsButton"
import { DataEditor } from "./DataEditor"
import { Column, CreateRow, InputRow } from "./shared"
import { Styled, Heading, Textarea } from "theme-ui"

export const ContentPanel: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)

  return (
    <Column bg={"panel"}>
      <Heading>Data</Heading>
      <DataEditor clean={global.data.data} />
      <Heading>Events List</Heading>
      <CreateRow
        defaultValue=""
        placeholder="Create Event"
        format={(name) => replace(name, " ", "_").toUpperCase()}
        onSubmit={(name) => global.send("ADDED_EVENT", name)}
      />

      <Styled.ul>
        {sortBy(Array.from(global.data.events.values()), "index").map(
          (event) => (
            <InputRow
              key={event.id}
              defaultValue={event.name}
              format={(name) => replace(name, " ", "_").toUpperCase()}
              onSubmit={(name) =>
                globalState.send("UPDATED_EVENT_NAME", {
                  eventId: event.id,
                  name,
                })
              }
              optionsButton={<EventOptionsButton event={event} />}
            />
          )
        )}
      </Styled.ul>

      <Heading>States List</Heading>
      <StateNodeButton node={global.data.states.get("root")} />
    </Column>
  )
}

const StateNodeButton: React.FC<{ node: State }> = ({ node }) => {
  const global = useStateDesigner(globalState)
  const childNodes = sortBy(
    Array.from(node.states.keys()).map((id) => global.data.states.get(id)),
    "index"
  )
  return (
    <>
      <StateListItem node={node} depth={node.depth} />
      {childNodes.length > 0 && (
        <Styled.ul sx={{ mt: 0, my: 0 }}>
          {childNodes.map((node) => (
            <Styled.li key={node.id}>
              <StateNodeButton node={node} />
            </Styled.li>
          ))}
        </Styled.ul>
      )}
    </>
  )
}
