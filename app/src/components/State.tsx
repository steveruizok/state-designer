import React from "react"
import { CodeEditor, Fences } from "./CodeEditor"
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
    initial: "closed",
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
      draggableIndex={index + 1}
      // title={`${state.id} - ${state.name}`}
      title={editing ? "" : state.name}
      options={options}
      canCancel={editing}
      canSave={editing}
      onSave={() => send("CLOSE")}
      onCancel={() => send("CLOSE")}
      onEdit={editing ? undefined : () => send("EDIT")}
    >
      {isIn("editing") ? (
        <>
          <Title>Name</Title>
          <CodeEditor
            value={state.name}
            onChange={code =>
              Collections.states.send("EDIT", {
                id: state.id,
                changes: { name: code }
              })
            }
          />
          <Title onCreate={() => states.send("CREATE_EVENT", { id: state.id })}>
            On
          </Title>
          <StateEvents state={state} />
        </>
      ) : (
        state.events.length > 0 && (
          <ul>
            {state.events.map((id, index) => {
              const event = Collections.events.data.get(id)
              if (!event) return

              return (
                <li key={index}>
                  {event.name}
                  {event.handlers.length > 0 && (
                    <ul>
                      {event.handlers.map((id, index) => {
                        const handler = Collections.handlers.data.get(id)
                        if (!handler) return

                        return (
                          <li key={index}>
                            {handler.get.length > 0 && (
                              <div>
                                Get
                                <ul>
                                  {handler.get.map(({ id }, index) => {
                                    const result = Collections.results.data.get(
                                      id
                                    )
                                    if (!result) return

                                    return <li key={index}>{result.name}</li>
                                  })}
                                </ul>
                              </div>
                            )}
                            {handler.if.length > 0 && (
                              <div>
                                If
                                <ul>
                                  {handler.if.map(({ id }, index) => {
                                    const condition = Collections.conditions.data.get(
                                      id
                                    )
                                    if (!condition) return

                                    return <li key={index}>{condition.name}</li>
                                  })}
                                </ul>
                              </div>
                            )}
                            {handler.do.length > 0 && (
                              <div>
                                Do
                                <ul>
                                  {handler.do.map(({ id }, index) => {
                                    const action = Collections.actions.data.get(
                                      id
                                    )
                                    if (!action) return

                                    return <li key={index}>{action.name}</li>
                                  })}
                                </ul>
                              </div>
                            )}
                            {handler.to && (
                              <div>
                                To:
                                <ul>
                                  <li>{handler.to}</li>
                                </ul>
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )
      )}
    </DraggableItem>
  )
}
