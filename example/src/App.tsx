import React from "react"
import { uniqueId } from "lodash-es"
import { ThemeProvider } from "emotion-theming"
import { useStateDesigner } from "state-designer"
import theme from "./theme"
import { Box, Flex, Button, Heading, Text } from "rebass"
import { Input } from "@rebass/forms"
import { AnimatePresence, motion } from "framer-motion"
import { Designer } from "./machines"
import DesignerComponent from "./components/Designer"
import {
  State,
  EventHandler,
  Handler,
  HandlerItems,
  NamedItem,
  CustomItem,
  EditableItem
} from "./machines/config/designer"

const App = () => {
  const { data, can, send } = useStateDesigner(Designer)

  return (
    <ThemeProvider theme={theme}>
      <DesignerComponent />
      {/* <Box variant="lists.loose">
        <Box variant="containers.state">
          <Heading>Events</Heading>
          <ul>
            {data.events.map(eventHandler => (
              <li key={eventHandler.id}>
                <Text>{eventHandler.dirty.name}</Text>
                <ul>
                  {eventHandler.dirty.handlers.map(handler => (
                    <HandlerItem key={handler.id} handler={handler} />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Box>
        <StatesList states={data.states} />
      </Box> */}
    </ThemeProvider>
  )
}

export default App

type StatesListProps = {
  states: EditableItem<State>[]
}

const StatesList: React.FC<StatesListProps> = ({ states }) => {
  return (
    <Box variant="containers.state">
      <Heading>States</Heading>
      <ul>
        {states.map(state => (
          <StateItem key={state.id} state={state} />
        ))}
      </ul>
    </Box>
  )
}

type StateItemProps = {
  state: EditableItem<State>
}

const StateItem: React.FC<StateItemProps> = ({ state }) => {
  return (
    <li>
      <Heading>{state.dirty.name}</Heading>
      <EventsList events={state.dirty.events} />
    </li>
  )
}

type StateEventsProps = {
  events: EventHandler[]
}

const EventsList: React.FC<StateEventsProps> = ({ events }) => {
  return (
    <Box>
      <Text>Events</Text>
      <ul>
        {events.map(eventHandler => (
          <EventHandlerItem key={eventHandler.id} eventHandler={eventHandler} />
        ))}
      </ul>
    </Box>
  )
}

type EventHandlerProps = {
  eventHandler: EventHandler
}

const EventHandlerItem: React.FC<EventHandlerProps> = ({ eventHandler }) => {
  return (
    <li>
      <Text>{eventHandler.name}</Text>
      <ul>
        {eventHandler.handlers.map(handler => (
          <HandlerItem key={handler.id} handler={handler} />
        ))}
      </ul>
    </li>
  )
}

type HandlerProps = {
  handler: Handler
}

const HandlerItem: React.FC<HandlerProps> = ({ handler }) => {
  return (
    <li>
      <Text>Handler Item</Text>
      <ul>
        <HandlerItemGroupProps name="Get" group={handler.get} />
        <HandlerItemGroupProps name="If" group={handler.if} />
        <HandlerItemGroupProps name="Do" group={handler.do} />
      </ul>
    </li>
  )
}

type HandlerItemGroupProps = {
  name: string
  group: (NamedItem | CustomItem)[]
}

const HandlerItemGroupProps: React.FC<HandlerItemGroupProps> = ({
  name,
  group
}) => {
  return (
    <li>
      <Text>{name}</Text>
      <ul>
        {group.map(item => (
          <li key={item.id}>
            {item.type === HandlerItems.Custom
              ? `() => ${item.code}`
              : item.name}
          </li>
        ))}
      </ul>
    </li>
  )
}
