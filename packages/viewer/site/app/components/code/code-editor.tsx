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

  const rPreviousValue = React.useRef(value)
  const rEditor = React.useRef<any>()

  // Update from clean changes
  React.useEffect(() => {
    const editor = rEditor.current
    if (!editor) return
    const currentValue = editor.getValue()

    if (clean !== currentValue) {
      editor.setValue(clean)
    }
  }, [clean])

  const handleEditorDidMount = (getValue, editor) => {
    rEditor.current = editor
    editor.getModel().updateOptions({ tabSize: 2 })

    // Update current value when the model changes
    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue()
      rPreviousValue.current = currentValue
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
        let currentValue = editor.getValue()

        const isValid = validate ? validate(currentValue) : true

        if (isValid && canSave()) {
          await editor.getAction("editor.action.formatDocument").run()

          currentValue = editor.getValue()
          rPreviousValue.current = currentValue

          onSave(currentValue)
        }
      }
    })

    editorDidMount(getValue, editor)
  }

  return (
    <ControlledEditor
      value={value}
      editorDidMount={handleEditorDidMount}
      onChange={(_, currentValue) => {
        const previousValue = rPreviousValue.current
        const isValid = validate ? validate(currentValue) : true

        return isValid ? currentValue : previousValue
      }}
      {...props}
    />
  )
}

export default CodeEditor
