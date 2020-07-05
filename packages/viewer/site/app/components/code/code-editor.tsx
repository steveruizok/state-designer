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
  onChange: (event: string, value: string, editor: any) => void
  editorDidMount: (value: string, editor: any) => void
  height?: string
  width?: string
  theme?: string
  language?: string
  options?: { [key: string]: any }
}> = ({ value, clean, validate, onChange, editorDidMount, ...props }) => {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      monaco.init()
    }
  }, [])

  const previousValue = React.useRef(value)
  const rEditor = React.useRef<any>()
  const debouncedOnChange = React.useMemo(
    () =>
      debounce((event: any, value: string) => {
        const isValid = validate ? validate(value) : true
        if (isValid) {
          onChange(event, value, undefined)
          return value
        } else {
          return previousValue.current
        }
      }, DEFAULT_UPDATE_DEBOUNCE_DELAY),
    [onChange]
  )

  React.useEffect(() => {
    const editor = rEditor.current
    const previous = previousValue.current

    if (value !== previous && editor) {
      const state = editor.saveViewState()
      editor.setValue(value)
      editor.restoreViewState(state)
    }
    previousValue.current = value
  }, [value])

  React.useEffect(() => {
    const editor = rEditor.current
    if (editor) {
      if (clean !== editor.getValue()) {
        editor.setValue(clean)
      }
      editor.getAction("editor.action.formatDocument").run()
    }
  }, [clean])

  const handleEditorDidMount = (getValue, editor) => {
    rEditor.current = editor

    editor.onDidChangeModelContent((ev: any) => {
      const currentValue = editor.getValue()
      if (currentValue !== previousValue.current) {
        previousValue.current = value
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

    editorDidMount(getValue, editor)
  }

  return (
    <ControlledEditor
      value={value}
      editorDidMount={handleEditorDidMount}
      {...props}
      onChange={(event, value) => {
        const isValid = validate ? validate(value) : true
        if (isValid) {
          previousValue.current = value
          onChange(event, value, undefined)
          return value
        } else {
          return previousValue.current
        }
      }}
    />
  )
}

export default CodeEditor
