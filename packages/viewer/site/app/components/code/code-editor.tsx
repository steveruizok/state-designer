// @refresh reset
import * as React from "react"
import { debounce } from "lodash"
import { monaco } from "@monaco-editor/react"

import { ControlledEditor } from "@monaco-editor/react"

const DEFAULT_UPDATE_DEBOUNCE_DELAY = 100

const CodeEditor: React.FC<{
  value: string
  clean: string
  validate?: (code: string) => boolean
  onSave: (code: string) => void
  canSave: () => boolean
  onChange: (value: string) => void
  editorDidMount: (value: string, editor: any) => void
  height?: string
  width?: string
  theme?: string
  language?: string
  options?: { [key: string]: any }
}> = ({
  value,
  clean,
  validate,
  canSave,
  onChange,
  onSave,
  editorDidMount,
  ...props
}) => {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      monaco.init()
    }
  }, [])

  const previousValue = React.useRef(value)
  const rEditor = React.useRef<any>()

  // Update from clean changes
  React.useEffect(() => {
    const editor = rEditor.current
    if (!editor) return
    const value = editor.getValue()

    if (clean !== value) {
      editor.setValue(clean)
    }
  }, [clean])

  const handleEditorDidMount = (getValue, editor) => {
    rEditor.current = editor

    // Update current value when the model changes
    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue()
      onChange(currentValue)
    })

    // Add a buffer to the top of the editor
    editor.changeViewZones((changeAccessor) => {
      const domNode = document && document.createElement("div")
      changeAccessor.addZone({
        afterLineNumber: 0,
        heightInLines: 1,
        domNode: domNode,
      })
    })

    // Save event
    editor.onKeyDown(async (e: KeyboardEvent) => {
      if (e.metaKey && e.code === "KeyS") {
        e.preventDefault()
        let value = editor.getValue()

        const isValid = validate ? validate(value) : true

        if (isValid && canSave()) {
          await editor.getAction("editor.action.formatDocument").run()

          value = editor.getValue()
          previousValue.current = value

          onSave(value)
        }
      }
    })

    editorDidMount(getValue, editor)
  }

  return (
    <ControlledEditor
      value={value}
      editorDidMount={handleEditorDidMount}
      {...props}
      onChange={(_, value) => {
        const isValid = validate ? validate(value) : true
        if (isValid) {
          return value
        } else {
          return previousValue.current
        }
      }}
    />
  )
}

export default CodeEditor
