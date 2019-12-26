import React from "react"
import { Box, Heading, Button } from "rebass"
import { StateDesigner, useStateDesigner } from "state-designer"
import { NamedFunctionListConfig } from "./machines/namedFunctionList"
import { AnimatePresence, motion } from "framer-motion"
import { NamedFunction } from "./NamedFunction"

export const NamedFunctionList: React.FC<{
  state: StateDesigner<NamedFunctionListConfig>
}> = ({ state }) => {
  const { data, send } = useStateDesigner(state, state => {})

  return (
    <Box p={2}>
      <Heading>Named Functions</Heading>
      <Button onClick={() => send("CREATE_ITEM")}>Add Action</Button>
      <ul>
        <AnimatePresence>
          {data.items.map((item, index) => {
            return (
              <motion.div
                positionTransition={{ duration: 0.2 }}
                key={item.id}
                exit={{ opacity: 0 }}
              >
                <NamedFunction
                  key={item.id}
                  state={item.item}
                  canMoveUp={index > 0 && data.items.length > 1}
                  onMoveUp={() => send("MOVE_ITEM", { id: item.id, delta: -1 })}
                  canMoveDown={index < data.items.length - 1}
                  onMoveDown={() =>
                    send("MOVE_ITEM", { id: item.id, delta: 1 })
                  }
                >
                  ...
                </NamedFunction>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </ul>
    </Box>
  )
}
