import React from "react"
import { CodeEditor } from "./CodeEditor"
import { Item } from "./item/Item"
import { uniqueId } from "lodash"
import { motion, useAnimation } from "framer-motion"
import { useStateDesigner } from "state-designer"

import * as DS from "./types"

export interface Props {
  events: {
    id: string
    editing: boolean
    clean: DS.Event
    dirty: DS.Event
  }[]
  machine: any
  code: string
  blinkSource: number
  onCodeChange: (data: any) => void
}

export const Preview: React.FC<Props> = ({
  events,
  code,
  machine,
  blinkSource,
  onCodeChange
}) => {
  const { data, send, can } = useStateDesigner(
    {
      data: {
        id: uniqueId(),
        hasChanges: false,
        editing: false,
        dirty: code,
        clean: code,
        error: undefined
      },
      on: {
        UPDATE_CODE: [
          {
            unless: "hasChanges",
            do: "updateChanges"
          },
          {
            do: ["updateCode", "updateError"]
          }
        ],
        BLUR: {
          unless: "hasChanges",
          do: "stopEditing"
        },
        EDIT: {
          do: "startEditing"
        },
        SAVE: {
          if: "codeIsValid",
          do: ["saveEdits", "stopEditing"]
        },
        CANCEL: {
          do: ["cancelEdits", "stopEditing"]
        }
      },
      actions: {
        updateChanges: data => (data.hasChanges = true),
        updateCode: (data, code) => {
          data.dirty = code
        },
        cancelEdits: data => {
          data.dirty = data.clean
        },
        saveEdits: data => {
          data.clean = data.dirty
          data.hasChanges = false
        },
        stopEditing: data => {
          data.editing = false
        },
        startEditing: data => {
          data.editing = true
        },
        updateError: data => {
          try {
            new Function(`
const obj = { ${data.dirty} }
if (typeof obj !== "object") {
  throw new Error("Data must be an object!")
}`)
          } catch (e) {
            data.error = e.message
            return
          }

          return (data.error = undefined)
        }
      },
      conditions: {
        hasChanges: data => data.hasChanges,
        codeIsValid: data => data.error === undefined
      }
    },
    state => onCodeChange(state.data.clean)
  )

  const { dirty, error, editing, clean, hasChanges } = data

  React.useEffect(
    function enableKeyboardSave() {
      function keyBoardSave(this: HTMLElement, e: KeyboardEvent) {
        if (e.key === "s" && e.metaKey) {
          e.preventDefault()
          send("SAVE")
        }
      }
      if (editing) {
        document.body.addEventListener("keydown", keyBoardSave)
      }
      return () => document.body.removeEventListener("keydown", keyBoardSave)
    },
    [editing]
  )

  const blink = useAnimation()

  React.useEffect(() => {
    async function runAnim() {
      await blink.start({
        border: "1px solid rgba(52, 51, 255,.25)",
        transition: {
          duration: 0.12
        }
      })

      await blink.start({
        border: "1px solid rgba(52, 51, 255,0)",
        transition: {
          duration: 0.12
        }
      })
    }

    runAnim()
  }, [blinkSource])

  return (
    <Item title="Preview" titleSize={3}>
      <Item
        {...{
          error,
          editing
        }}
        dirty={hasChanges}
        onCancel={() => send("CANCEL")}
        onSave={() => send("SAVE")}
        onReset={() => {
          machine.send("_RESET")
        }}
      >
        <motion.div
          animate={blink}
          style={{ border: "1px solid rgba(52, 51, 255,0)", borderRadius: 4 }}
        >
          <CodeEditor
            ignoreTab={false}
            value={editing ? dirty : JSON.stringify(machine.data, null, 2)}
            error={error}
            startWith={
              editing
                ? `{
  `
                : undefined
            }
            endWith={
              editing
                ? `
}`
                : undefined
            }
            onFocus={() => send("EDIT")}
            onBlur={() => send("BLUR")}
            onChange={code => send("UPDATE_CODE", code)}
          />
        </motion.div>
      </Item>
      {/* <CodeEditor value={JSON.stringify(machine.data, null, 2)} /> */}
      {/* <List>
        {events.map((event, index: number) => (
          <Button
            py={3}
            key={index}
            disabled={!machine.can(event.clean.name)}
            onClick={() => machine.send(event.clean.name)}
          >
            {event.clean.name}
          </Button>
        ))}
      </List> */}
    </Item>
  )
}
