import React from "react"
import { Box, Heading, Button } from "rebass"
import { List } from "./List"
import { TitleRow } from "./TitleRow"
import { NamedFunction } from "./NamedFunction"
import { StateDesigner, useStateDesigner } from "state-designer"
import { ActionListConfig } from "./machines/actionList"
import { ConditionListConfig } from "./machines/conditionList"
import { AnimatePresence, motion } from "framer-motion"

type NamedListConfig = ActionListConfig | ConditionListConfig

export const NamedFunctionList: React.FC<{
  name: string
  state: StateDesigner<NamedListConfig>
  onChange: (data: NamedListConfig["data"]) => void
}> = ({ name, state, onChange }) => {
  const { data, send } = useStateDesigner(state, state => onChange(state.data))

  return (
    <Box>
      <TitleRow>
        <Heading>{name}s</Heading>
        <Button onClick={() => send("CREATE_ITEM")}>Add {name}</Button>
      </TitleRow>
      <List>
        <AnimatePresence>
          {data.items.map((item, index) => {
            return (
              <motion.div
                positionTransition={{ duration: 0.2 }}
                key={item.id}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
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
                  onRemove={() => send("REMOVE_ITEM", { id: item.id })}
                  onChange={() => onChange(data)}
                >
                  ...
                </NamedFunction>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </List>
    </Box>
  )
}
