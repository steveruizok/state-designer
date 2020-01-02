import React from "react"
import { Button } from "./Inputs"
import { Box, Heading } from "rebass"
import { List } from "./List"
import { TitleRow } from "./TitleRow"
import { NamedFunction } from "./NamedFunction"
import { StateDesigner, useStateDesigner } from "state-designer"
import { ActionListConfig } from "./machines/actionList"
import { ConditionListConfig } from "./machines/conditionList"
import { AnimatePresence, motion } from "framer-motion"
import { Item } from "./item/Item"

type NamedListConfig = ActionListConfig | ConditionListConfig

export const NamedFunctionList: React.FC<{
  name: string
  state: StateDesigner<NamedListConfig>
  onChange: (data: NamedListConfig["data"]) => void
}> = ({ name, state, onChange }) => {
  const { data, send } = useStateDesigner(state, state => onChange(state.data))

  return (
    <Item title={name + "s"} onCreate={() => send("CREATE_ITEM")}>
      <List>
        <AnimatePresence>
          {data.items.map((item, index) => {
            const { id } = item
            return (
              <motion.div
                positionTransition={{ duration: 0.2 }}
                key={id}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <NamedFunction
                  key={id}
                  state={item.item}
                  canMoveUp={index > 0 && data.items.length > 1}
                  onMoveUp={() => send("MOVE_ITEM", { id, delta: -1 })}
                  canMoveDown={index < data.items.length - 1}
                  onMoveDown={() => send("MOVE_ITEM", { id, delta: 1 })}
                  onDuplicate={() => send("DUPLICATE_ITEM", { id })}
                  onRemove={() => send("REMOVE_ITEM", { id })}
                  onChange={() => onChange(data)}
                >
                  ...
                </NamedFunction>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </List>
    </Item>
  )
}
