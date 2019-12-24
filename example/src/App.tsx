import React from "react"
import { uniqueId } from "lodash-es"
import { ThemeProvider } from "emotion-theming"
import { useStateDesigner, StateDesigner } from "state-designer"
import theme from "./theme"
import Panel from "./components/Panel"
import TitleRow from "./components/TitleRow"
import ItemRow from "./components/ItemRow"
import { Box, Flex, Button, Heading } from "rebass"
import { Input } from "@rebass/forms"
import { AnimatePresence, motion } from "framer-motion"

const machine = new StateDesigner({
  data: {
    count: 1
  },
  on: {
    INCREMENT: {
      do: "increment",
      unless: "atMax"
    },
    DECREMENT: {
      do: "decrement",
      unless: "atMin"
    }
  },
  actions: {
    increment: data => data.count++,
    decrement: data => data.count--
  },
  conditions: {
    aboveMin: data => data.count > 0,
    belowMax: data => data.count < 10,
    atMax: data => data.count === 10,
    atMin: data => data.count === 0
  },
  results: {
    double: data => data.count * 2
  }
})

const states = [
  {
    id: uniqueId(),
    name: "Root",
    eventHandlers: []
  }
]

type Item = {
  id: string
  clean: {
    value: string
  }
  dirty: {
    value: string
  }
  editing: boolean
}

const App = () => {
  const [state, setState] = React.useState(5)
  const { data, can, send, values } = useStateDesigner(
    {
      data: {
        count: 1,
        items: [
          {
            id: uniqueId(),
            clean: {
              value: "Hello world"
            },
            dirty: {
              value: "Hello world"
            },
            editing: false
          }
        ] as Item[]
      },
      on: {
        ADD_ITEM: {
          do: "addItem"
        },
        REMOVE_ITEM: {
          get: "itemIndex",
          do: "removeItem"
        },
        UPDATE_ITEM: {
          get: "item",
          do: "updateItem"
        },
        EDIT_ITEM: {
          get: "item",
          do: "startEditingItem"
        },
        MOVE_ITEM: {
          get: "itemIndex",
          if: "canMoveItem",
          do: "moveItem"
        },
        SAVE_ITEM_EDIT: {
          get: "item",
          do: ["saveEditingItem", "stopEditingItem"]
        },
        CANCEL_ITEM_EDIT: {
          get: "item",
          do: "stopEditingItem"
        },
        // Counter
        INCREMENT: {
          do: "increment",
          unless: "atMax"
        },
        DECREMENT: {
          do: "decrement",
          unless: "atMin"
        }
      },
      results: {
        item: (data, { id }) => data.items.find(item => item.id === id),
        itemIndex: (data, { id }) =>
          data.items.findIndex(item => item.id === id)
      },
      actions: {
        // Items
        addItem: data =>
          data.items.push({
            id: uniqueId(),
            clean: {
              value: "Hello world"
            },
            dirty: {
              value: "Hello world"
            },
            editing: false
          }),
        moveItem: (data, { delta }, index) => {
          const t = data.items[index]
          data.items[index] = data.items[index + delta]
          data.items[index + delta] = t
        },
        removeItem: (data, payload, index: number) => {
          data.items.splice(index, 1)
        },
        updateItem: (data, { value }, item: Item) => {
          item.dirty.value = value
        },
        saveEditingItem: (data, payload, item: Item) => {
          item.clean.value = item.dirty.value
        },
        stopEditingItem: (data, payload, item: Item) => {
          item.dirty.value = item.clean.value
          item.editing = false
        },
        startEditingItem: (data, payload, item: Item) => {
          item.dirty.value = item.clean.value
          item.editing = true
        },
        // Counter
        increment: data => data.count++,
        decrement: data => data.count--
      },
      conditions: {
        // Items
        canMoveItem: (data, { delta }, index) =>
          !(delta + index < 0 || delta + index > data.items.length - 1),
        valueIsValid: (data, payload, item) => item.dirty.value.length > 3,
        // Counter
        aboveMin: data => data.count > 0,
        belowMax: data => data.count < state,
        atMax: data => data.count === state,
        atMin: data => data.count === 0
      },
      values: {
        double: data => data.count * 2
      }
    },
    [state]
  )

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Panel>
          <Box px={2}>
            <Flex my={2} justifyContent="space-between">
              <Heading>Items</Heading>
              <Button onClick={() => send("ADD_ITEM")}>+ Add Item</Button>
            </Flex>
            <AnimatePresence>
              {data.items.map((item, index) => {
                const { editing, id } = item
                const canMoveDown = can("MOVE_ITEM", { id, delta: -1 })
                const canMoveUp = can("MOVE_ITEM", { id, delta: 1 })
                return (
                  <motion.div
                    positionTransition={{ duration: 0.2 }}
                    key={item.id}
                    exit={{ opacity: 0 }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridGap: 1,
                        gridTemplateColumns:
                          "1fr repeat(auto-fit, min-content)",
                        gridAutoFlow: "column"
                      }}
                      mb={2}
                    >
                      <Input
                        readOnly={!editing}
                        value={item.dirty.value}
                        style={{ width: "100%" }}
                        onChange={(e: any) =>
                          send("UPDATE_ITEM", { id, value: e.target.value })
                        }
                      />
                      {editing ? (
                        <>
                          {item.dirty.value.length === 0 ? (
                            <Button onClick={() => send("REMOVE_ITEM", { id })}>
                              Delete
                            </Button>
                          ) : (
                            <Button
                              onClick={() => send("SAVE_ITEM_EDIT", { id })}
                            >
                              Save
                            </Button>
                          )}
                          <Button
                            onClick={() => send("CANCEL_ITEM_EDIT", { id })}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => send("EDIT_ITEM", { id })}>
                            Edit
                          </Button>
                          <Button
                            variant={canMoveDown ? "primary" : "disabled"}
                            disabled={!canMoveDown}
                            onClick={() => send("MOVE_ITEM", { id, delta: -1 })}
                          >
                            ▲
                          </Button>
                          <Button
                            variant={canMoveUp ? "primary" : "disabled"}
                            disabled={!canMoveUp}
                            onClick={() => send("MOVE_ITEM", { id, delta: 1 })}
                          >
                            ▼
                          </Button>
                        </>
                      )}
                    </Box>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </Box>
          <div>...</div>
          <h2>Count: {data.count}</h2>
          <button onClick={() => send("INCREMENT")}>+</button>
          <button onClick={() => send("DECREMENT")}>-</button>
          <button onClick={() => setState(state + 1)}>Reset</button>
          <TitleRow>States</TitleRow>
          {states.map((state, i) => (
            <ItemRow key={i}>{state.name}</ItemRow>
          ))}
          <div>Data</div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <div>Values:</div>
          <pre>{JSON.stringify(values, null, 2)}</pre>
          <div>...</div>
        </Panel>
      </Box>
    </ThemeProvider>
  )
}

export default App
