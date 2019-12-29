import React from "react"
import { Button } from "./Inputs"
import { Box, Heading } from "rebass"
import { CodeEditor } from "./CodeEditor"
import { List } from "./List"

import * as DS from "./types"

export interface Props {
  events: {
    id: string
    editing: boolean
    clean: DS.Event
    dirty: DS.Event
  }[]
  machine: any
}

export const Preview: React.FC<Props> = ({ events, machine }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr",
        columnGap: 2,
        rowGap: 2,
        alignItems: "center"
      }}
    >
      <Heading>Current Data</Heading>
      <CodeEditor value={JSON.stringify(machine.data, null, 2)} />
      <List>
        {events.map((event, index: number) => (
          <Button
            py={3}
            key={index}
            onClick={() => machine.send(event.clean.name)}
          >
            {event.clean.name}
          </Button>
        ))}
      </List>
    </Box>
  )
}
