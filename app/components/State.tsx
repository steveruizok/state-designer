import React from "react"
import { Collections } from "../machines/Collections"
import { StateEvents } from "./StateEvents"
import { useStateDesigner } from "state-designer"
import { DraggableItem } from "../components/DraggableItem"
import { Title } from "./Title"
import * as DS from "../interfaces"

export interface Props {
  state: DS.State
  index: number
}

export const State: React.FC<Props> = ({ state, index, children }) => {
  const states = useStateDesigner(Collections.states)

  const { send, isIn } = useStateDesigner({
    data: {},
    initial: "editing",
    states: {
      editing: {
        on: {
          CLOSE: {
            to: "closed"
          }
        }
      },
      closed: {
        on: {
          EDIT: {
            to: "editing"
          }
        }
      }
    }
  })

  const options: { [key: string]: () => void } = {
    remove() {
      states.send("REMOVE", {
        id: state.id
      })
    },
    duplicate() {
      states.send("DUPLICATE", {
        id: state.id
      })
    }
  }

  if (index > 0) {
    options["move down"] = () =>
      states.send("MOVE", {
        id: state.id,
        target: index - 1
      })
  }

  if (index < state.events.length - 1) {
    options["move up"] = () =>
      states.send("MOVE", {
        id: state.id,
        target: index + 1
      })
  }

  const editing = isIn("editing")

  return (
    <DraggableItem
      key={state.id}
      draggable={states.data.size > 1}
      draggableId={state.id}
      draggableIndex={index}
      // title={`${state.id} - ${state.name}`}
      title={state.name}
      options={options}
      canCancel={editing}
      canSave={editing}
      onCancel={() => send("CLOSE")}
      onEdit={editing ? undefined : () => send("EDIT")}
    >
      {isIn("editing") && (
        <>
          <Title onCreate={() => states.send("CREATE_EVENT", { id: state.id })}>
            On
          </Title>
          <StateEvents state={state} />
        </>
      )}
    </DraggableItem>
  )
}
