import React from "react"
import { Box, Heading, Button } from "rebass"
import { EventConfig } from "./machines/event"
import { StateDesigner, useStateDesigner } from "state-designer"
import { HandlerItem } from "./HandlerItem"
import { TitleRow } from "./TitleRow"
import { List } from "./List"
import { FlatList } from "./FlatList"
import { CodeEditor } from "./CodeEditor"
import { AnimatePresence, motion } from "framer-motion"

export interface Props {
  event: StateDesigner<EventConfig>
  actions: any
  conditions: any
  onChange: () => void
  onMoveDown: () => void
  onMoveUp: () => void
  onRemove: () => void
  canMoveDown: boolean
  canMoveUp: boolean
}

// TODO:
// - Controls to edit / save / cancel event edits
// - Controls to move / remove events
// - Controls to move / remove event handlers
// - Controls to move / remove event handler items
// - Controls to turn event handler item into named functions

export const Event: React.FC<Props> = ({
  event,
  actions,
  conditions,
  onChange,
  canMoveDown,
  canMoveUp,
  onMoveDown,
  onMoveUp,
  onRemove
}) => {
  const { data, can, send } = useStateDesigner(event, onChange)
  const { id, editing, dirty } = data
  const { name, handlers } = dirty

  return (
    <List p={1} sx={{ gap: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      {editing ? (
        <>
          <CodeEditor
            value={name}
            onChange={code => send("UPDATE_NAME", { name: code.toUpperCase() })}
          />
          <List sx={{ border: "1px solid #ccc", borderRadius: 8 }}>
            <TitleRow p={2}>
              <Heading fontSize={3}>Event Handlers</Heading>
              <Button onClick={() => send("CREATE_EVENT_HANDLER")}>
                Create Event Handler
              </Button>
            </TitleRow>
            <AnimatePresence>
              {handlers.map((handler, index) => {
                const canMoveUp = can("MOVE_EVENT_HANDLER", {
                  id: handler.id,
                  delta: -1
                })
                const canMoveDown = can("MOVE_EVENT_HANDLER", {
                  id: handler.id,
                  delta: 1
                })
                return (
                  <motion.div
                    positionTransition={{ duration: 0.2 }}
                    key={handler.id}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  >
                    <Box
                      key={handler.id}
                      m={1}
                      p={1}
                      sx={{
                        backgroundColor: "rgba(255, 220, 255, .08)",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        gap: 16
                      }}
                    >
                      <FlatList mb={3}>
                        <Heading fontSize={3}>Event Handler</Heading>
                        <Button
                          disabled={!canMoveDown}
                          opacity={canMoveDown ? 1 : 0.5}
                          onClick={() =>
                            send("MOVE_EVENT_HANDLER", {
                              id: handler.id,
                              delta: 1
                            })
                          }
                        >
                          ▼
                        </Button>
                        <Button
                          disabled={!canMoveUp}
                          opacity={canMoveUp ? 1 : 0.5}
                          onClick={() =>
                            send("MOVE_EVENT_HANDLER", {
                              id: handler.id,
                              delta: -1
                            })
                          }
                        >
                          ▲
                        </Button>
                        <Button
                          onClick={() =>
                            send("REMOVE_EVENT_HANDLER", {
                              id: handler.id
                            })
                          }
                        >
                          X
                        </Button>
                      </FlatList>
                      <List
                        p={2}
                        mb={3}
                        sx={{
                          backgroundColor: "rgba(255, 220, 255, .08)",
                          border: "1px solid #ccc",
                          borderRadius: 8,
                          gap: 16
                        }}
                      >
                        <TitleRow>
                          <Heading fontSize={3}>Actions</Heading>
                          <Button
                            onClick={() =>
                              send("CREATE_HANDLER_ACTION", {
                                handlerId: handler.id,
                                mustReturn: false
                              })
                            }
                          >
                            Add Action
                          </Button>
                        </TitleRow>
                        <AnimatePresence>
                          {handler.do.map((item, j) => {
                            const canMoveDown = can("MOVE_HANDLER_ACTION", {
                              handlerId: handler.id,
                              id: item.id,
                              delta: 1
                            })
                            const canMoveUp = can("MOVE_HANDLER_ACTION", {
                              handlerId: handler.id,
                              id: item.id,
                              delta: -1
                            })
                            return (
                              <motion.div
                                positionTransition={{ duration: 0.2 }}
                                key={item.id}
                                exit={{
                                  opacity: 0,
                                  transition: { duration: 0.2 }
                                }}
                              >
                                <HandlerItem
                                  key={j}
                                  items={actions}
                                  item={item}
                                  canMoveDown={canMoveDown}
                                  canMoveUp={canMoveUp}
                                  onMoveDown={() =>
                                    send("MOVE_HANDLER_ACTION", {
                                      handlerId: handler.id,
                                      id: item.id,
                                      delta: 1
                                    })
                                  }
                                  onMoveUp={() =>
                                    send("MOVE_HANDLER_ACTION", {
                                      handlerId: handler.id,
                                      id: item.id,
                                      delta: -1
                                    })
                                  }
                                  onRemove={() =>
                                    send("REMOVE_HANDLER_ACTION", {
                                      handlerId: handler.id,
                                      id: item.id
                                    })
                                  }
                                  onChangeCode={code =>
                                    send("UPDATE_HANDLER_ACTION", {
                                      handlerId: handler.id,
                                      id: item.id,
                                      name: item.name || "custom",
                                      code
                                    })
                                  }
                                  onChangeName={code =>
                                    send("UPDATE_HANDLER_ACTION", {
                                      handlerId: handler.id,
                                      id: item.id,
                                      code: item.code,
                                      name: code || "custom"
                                    })
                                  }
                                />
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </List>
                      <List
                        mb={3}
                        p={2}
                        sx={{
                          backgroundColor: "rgba(255, 220, 255, .08)",
                          border: "1px solid #ccc",
                          borderRadius: 8,
                          gap: 16
                        }}
                      >
                        <TitleRow>
                          <Heading fontSize={3}>Conditions</Heading>
                          <Button
                            onClick={() =>
                              send("CREATE_HANDLER_CONDITION", {
                                handlerId: handler.id,
                                mustReturn: true
                              })
                            }
                          >
                            Add Condition
                          </Button>
                        </TitleRow>
                        <AnimatePresence>
                          {handler.if.map((item, j) => {
                            const canMoveDown = can("MOVE_HANDLER_CONDITION", {
                              handlerId: handler.id,
                              id: item.id,
                              delta: 1
                            })
                            const canMoveUp = can("MOVE_HANDLER_CONDITION", {
                              handlerId: handler.id,
                              id: item.id,
                              delta: -1
                            })

                            return (
                              <motion.div
                                positionTransition={{ duration: 0.2 }}
                                key={item.id}
                                exit={{
                                  opacity: 0,
                                  transition: { duration: 0.2 }
                                }}
                              >
                                <HandlerItem
                                  key={j}
                                  items={conditions}
                                  item={item}
                                  canMoveDown={canMoveDown}
                                  canMoveUp={canMoveUp}
                                  onMoveDown={() =>
                                    send("MOVE_HANDLER_CONDITION", {
                                      handlerId: handler.id,
                                      id: item.id,
                                      delta: 1
                                    })
                                  }
                                  onMoveUp={() =>
                                    send("MOVE_HANDLER_CONDITION", {
                                      handlerId: handler.id,
                                      id: item.id,
                                      delta: -1
                                    })
                                  }
                                  onRemove={() =>
                                    send("REMOVE_HANDLER_CONDITION", {
                                      handlerId: handler.id,
                                      id: item.id
                                    })
                                  }
                                  onChangeCode={code =>
                                    send("UPDATE_HANDLER_CONDITION", {
                                      handlerId: handler.id,
                                      id: item.id,
                                      name: item.name || "custom",
                                      code
                                    })
                                  }
                                  onChangeName={code =>
                                    send("UPDATE_HANDLER_CONDITION", {
                                      handlerId: handler.id,
                                      id: item.id,
                                      code: item.code,
                                      name: code || "custom"
                                    })
                                  }
                                />
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </List>
                    </Box>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </List>
          <Box
            sx={{
              display: "grid",
              gridAutoFlow: "column",
              gap: 1
            }}
          >
            <Button onClick={() => send("CANCEL_EVENT_EDIT")}>Cancel</Button>
            <Button onClick={() => send("SAVE_EVENT_EDIT")}>Save</Button>
          </Box>
        </>
      ) : (
        <FlatList>
          <CodeEditor
            value={name}
            readOnly
            onChange={code => send("UPDATE_NAME", { name: code.toUpperCase() })}
          />
          <Button onClick={() => send("EDIT_EVENT")}>Edit</Button>
          <Button
            disabled={!canMoveDown}
            opacity={canMoveDown ? 1 : 0.5}
            onClick={onMoveDown}
          >
            ▼
          </Button>
          <Button
            disabled={!canMoveUp}
            opacity={canMoveUp ? 1 : 0.5}
            onClick={onMoveUp}
          >
            ▲
          </Button>
          <Button onClick={onRemove}>X</Button>
        </FlatList>
      )}
    </List>
  )
}
