// @refresh reset
import * as React from "react"
import { debounce } from "lodash"
import { initMonaco } from "./monaco"

import Editor from "@monaco-editor/react"

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
      initMonaco()
    }
  }, [])

  const rPreviousValue = React.useRef(value)
  const rEditor = React.useRef<any>()

  // We might be updating from firebase changes
  React.useEffect(() => {
    const editor = rEditor.current
    if (!editor) return
    const currentValue = editor.getValue()

    // We've updated from firebase changes
    if (clean !== currentValue) {
      editor.setValue(clean)
    } else {
      // We've updated from saved local changes, so noop
    }
  }, [clean])

  const handleEditorDidMount = (getValue, editor) => {
    rEditor.current = editor
    const model = editor.getModel()

    model.setValue(value)
    model.updateOptions({ tabSize: 2 })

    // Update current value when the model changes
    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue()

      const previousValue = rPreviousValue.current
      const isValid = validate ? validate(currentValue) : true

      if (isValid) {
        onChange(currentValue)
        rPreviousValue.current = currentValue
      } else {
        // User's change was invalid, so undo the change
        if (currentValue === previousValue) return
        const model = editor.getModel()
        model.undo()
      }
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
          // Run prettier
          await editor.getAction("editor.action.formatDocument").run()

          // Then update previous value
          currentValue = editor.getValue()
          rPreviousValue.current = currentValue

          // And run onSave
          onSave(currentValue)
        }
      }
    })

    editorDidMount(getValue, editor)
  }

  return <Editor {...props} editorDidMount={handleEditorDidMount} />
}

export default CodeEditor
