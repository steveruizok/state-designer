import React from "react"
import { Button } from "./Inputs"
import { Box, Heading } from "rebass"
import { EventConfig } from "./machines/event"
import { StateDesigner, useStateDesigner } from "state-designer"
import { TitleRow } from "./TitleRow"
import { List } from "./List"
import { CodeEditor } from "./CodeEditor"
import { ClosedEvent } from "./ClosedEvent"
import { SaveCancelButtons } from "./SaveCancelButtons"
import { Mover } from "./Mover"
import { MovingHeader } from "./MovingHeader"
import { AnimatePresence } from "framer-motion"
import { EventHandler } from "./EventHandler"
import { EventHandlerItemList } from "./EventHandlerItemList"
import * as DS from "./types"

export interface Props {
  event: StateDesigner<EventConfig>
  actions: DS.NamedAction[]
  conditions: DS.NamedCondition[]
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
        <List>
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
              {handlers.map((handler, index) => (
                <EventHandler
                  key={handler.id}
                  handler={handler}
                  event={event}
                  onChange={onChange}
                  actions={actions}
                  conditions={conditions}
                />
              ))}
            </AnimatePresence>
          </List>
          <SaveCancelButtons
            canSave={can("SAVE_EVENT_EDIT")}
            onCancel={() => send("CANCEL_EVENT_EDIT")}
            onSave={() => send("SAVE_EVENT_EDIT")}
          />
        </List>
      ) : (
        <ClosedEvent
          name={name}
          onEdit={() => send("EDIT_EVENT")}
          onMoveUp={onMoveUp}
          canMoveUp={canMoveUp}
          onMoveDown={onMoveDown}
          canMoveDown={canMoveDown}
          onRemove={onRemove}
        />
      )}
    </List>
  )
}
