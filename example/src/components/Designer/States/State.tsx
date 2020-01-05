import React from "react"
import { Item } from "../item/Item"
import { Title } from "../item/Title"
import { StateDesigner, useStateDesigner } from "state-designer"
import { emptyEventConfig, EventConfig } from "../machines/event"
import { StateConfig, StateConfigData, stateConfig } from "../machines/state"
import { DragDropContext, Droppable } from "react-beautiful-dnd"
import { uniqueId } from "lodash-es"
import { Event } from "../Event"

export interface Props {
  state: StateConfig
  actions: any
  conditions: any
  onEventFire: (name: string) => void
  canEventFire: (name: string) => boolean
  onChange: (data: StateConfig["data"]) => void
}

export const State: React.FC<Props> = ({
  state,
  onChange,
  conditions,
  actions,
  canEventFire,
  onEventFire,
  children
}) => {
  const { data, can, send, isIn } = useStateDesigner(stateConfig)

  console.log(data.on.length)

  return (
    <Item>
      <Title onCreate={() => send("CREATE_EVENT")}>On</Title>
      <DragDropContext
        onDragEnd={result =>
          send("MOVE_EVENT", {
            id: result.draggableId,
            target: result.destination
          })
        }
      >
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {data.on.map((item, index) => {
                return (
                  <Event
                    key={item.id}
                    event={item}
                    actions={actions}
                    conditions={conditions}
                    onEventFire={onEventFire}
                    canEventFire={canEventFire(item.data.clean.name)}
                    onChange={() => onChange(data)}
                    canMoveUp={index > 0 && data.on.length > 1}
                    onMoveUp={() =>
                      send("MOVE_EVENT", { id: item.id, delta: -1 })
                    }
                    canMoveDown={index < data.on.length - 1}
                    onMoveDown={() =>
                      send("MOVE_EVENT", { id: item.id, delta: 1 })
                    }
                    onRemove={() => send("REMOVE_EVENT", { id: item.id })}
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
