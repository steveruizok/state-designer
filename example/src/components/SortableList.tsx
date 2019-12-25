import React from "react"
import { Box, Flex, Button, Heading } from "rebass"
import { Input } from "@rebass/forms"
import { useStateDesigner } from "state-designer"
import { AnimatePresence, motion } from "framer-motion"
import { List } from "../machines"

export interface Props {}

const SortableList: React.FC<Props> = ({ children }) => {
  const { data, send, can } = useStateDesigner(List)

  return (
    <Box>
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
                  gridTemplateColumns: "1fr repeat(auto-fit, min-content)",
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
                      <Button onClick={() => send("SAVE_ITEM_EDIT", { id })}>
                        Save
                      </Button>
                    )}
                    <Button onClick={() => send("CANCEL_ITEM_EDIT", { id })}>
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
      <Heading>Data</Heading>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  )
}

export default SortableList
