import React from "react"
import { Button } from "./Inputs"
import { Box, Heading } from "rebass"
import { CodeEditor } from "./CodeEditor"
import { List } from "./List"
import { Item } from "./item/Item"

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
    <Item title="Preview" titleSize={3}>
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
    </Item>
  )
}
