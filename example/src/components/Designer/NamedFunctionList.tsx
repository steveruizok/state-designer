import React from "react"
import { Button } from "./Inputs"
import { Box, Heading } from "rebass"
import { List } from "./List"
import { TitleRow } from "./TitleRow"
import { NamedFunction } from "./NamedFunction"
import { StateDesigner, useStateDesigner } from "state-designer"
import { ActionListConfig } from "./machines/actionList"
import { ConditionListConfig } from "./machines/conditionList"
import { DragDropContext, Droppable } from "react-beautiful-dnd"
import { Item } from "./item/Item"
import { Title } from "./item/Title"

type NamedListConfig = ActionListConfig | ConditionListConfig

export const NamedFunctionList: React.FC<{
  name: string
  state: StateDesigner<NamedListConfig>
  onChange: (data: NamedListConfig["data"]) => void
}> = ({ name, state, onChange }) => {
  const { data, send, can } = useStateDesigner(state, state =>
    onChange(state.data)
  )

  return (
    <Item title={name + "s"} titleSize={3} onCreate={() => send("CREATE_ITEM")}>
      <DragDropContext
        onDragEnd={result =>
          send("MOVE_ITEM", {
            id: result.draggableId,
            target: result.destination
          })
        }
      >
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {data.items.map((item, index) => {
                const { id } = item
                return (
                  <NamedFunction
                    key={id}
                    draggable={data.items.length > 1}
                    draggableId={id}
                    draggableIndex={index}
                    state={item.item}
                    canDrag={data.items.length > 1}
                    canMoveUp={can("MOVE_ITEM", {
                      id,
                      target: index - 1
                    })}
                    onMoveUp={() =>
                      send("MOVE_ITEM", { id, target: index - 1 })
                    }
                    canMoveDown={can("MOVE_ITEM", {
                      id,
                      target: index + 1
                    })}
                    onMoveDown={() =>
                      send("MOVE_ITEM", { id, target: index + 1 })
                    }
                    onDuplicate={() => send("DUPLICATE_ITEM", { id })}
                    onRemove={() => send("REMOVE_ITEM", { id })}
                    onChange={() => onChange(data)}
                  />
                )
              })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Item>
  )
}
