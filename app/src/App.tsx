import React from "react"
import { clearLocalStorage } from "./Utils"
import sortBy from "lodash/sortBy"
import { Box, Flex } from "rebass"
import { ThemeProvider } from "emotion-theming"
import theme from "./components/theme"
import { Condition } from "./components/named/Condition"
import { Result } from "./components/named/Result"
import { Action } from "./components/named/Action"
import { DragList } from "./components/DragList"
import { Title } from "./components/Title"
import { Item } from "./components/Item"
import { States } from "./components/States"
import { Preview } from "./components/Preview"
import { useStateDesigner } from "state-designer"
import { Collections } from "./machines/Collections"
import { Editor } from "./components/Editor/Editor"

const CLEAR_LOCAL = false

const App: React.FC = () => {
  const states = useStateDesigner(Collections.states)
  const events = useStateDesigner(Collections.events)
  const handlers = useStateDesigner(Collections.handlers)
  const actions = useStateDesigner(Collections.actions)
  const conditions = useStateDesigner(Collections.conditions)
  const results = useStateDesigner(Collections.results)

  React.useEffect(() => {
    if (CLEAR_LOCAL) {
      clearLocalStorage()
      return () => clearLocalStorage()
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        <h1>State Designer</h1>
        <Flex sx={{ flexWrap: "wrap" }}>
          <Box minWidth={375} mr={3}>
            <h2>Preview</h2>
            <Title mb={3} />
            <Preview />
          </Box>
          <Box minWidth={375} mr={3}>
            <Box width={"minmax(480px, 600px"}>
              <h2>States</h2>
              <Title mb={3} onCreate={() => states.send("CREATE")}></Title>
              <States />
            </Box>
          </Box>
          <Box minWidth={375} mr={4}>
            <h2>Actions</h2>
            <Title mb={3} onCreate={() => actions.send("CREATE")} />
            <DragList
              id="actions"
              onDragEnd={result =>
                result.destination &&
                actions.send("MOVE", {
                  actionId: result.draggableId,
                  target: result.destination.index - 1
                })
              }
            >
              {sortBy(Array.from(actions.data.values()), "index").map(
                (action, index) => (
                  <Action key={action.id} index={index} action={action} />
                )
              )}
            </DragList>
            <h2>Conditions</h2>
            <Title onCreate={() => conditions.send("CREATE")} />
            <DragList
              id="conditions"
              onDragEnd={info =>
                info.destination &&
                conditions.send("MOVE", {
                  conditionId: info.draggableId,
                  target: info.destination.index - 1
                })
              }
            >
              {sortBy(Array.from(conditions.data.values()), "index").map(
                (condition, index) => (
                  <Condition
                    key={condition.id}
                    index={index}
                    condition={condition}
                  />
                )
              )}
            </DragList>
            <h2>Results</h2>
            <Title onCreate={() => results.send("CREATE")} />
            <DragList
              id="results"
              onDragEnd={info =>
                info.destination &&
                results.send("MOVE", {
                  resultId: info.draggableId,
                  target: info.destination.index - 1
                })
              }
            >
              {sortBy(Array.from(results.data.values()), "index").map(
                (result, index) => (
                  <Result key={result.id} index={index} result={result} />
                )
              )}
            </DragList>
            <h2>Events</h2>
            <Title onCreate={() => events.send("CREATE")} />
            {Array.from(events.data.values()).map((event, index) => (
              <Item
                key={index}
                title={`${event.id}-${event.name}`}
                options={{
                  remove() {
                    Collections.events.send("REMOVE", {
                      eventId: event.id
                    })
                  }
                }}
              />
            ))}
            <h2>Event Handlers</h2>
            <Title onCreate={() => handlers.send("CREATE")} />
            {Array.from(handlers.data.values()).map((handler, index) => (
              <Item key={index} title={handler.id} />
            ))}
          </Box>
        </Flex>
      </Box>
      <Editor />
    </ThemeProvider>
  )
}

export default App
