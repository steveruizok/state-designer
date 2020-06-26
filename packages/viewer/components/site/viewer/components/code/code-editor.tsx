import * as React from "react"
import debounce from "lodash.debounce"
import { monaco } from "@monaco-editor/react"

import Editor from "@monaco-editor/react"

const DEFAULT_UPDATE_DEBOUNCE_DELAY = 100

const CodeEditor: React.FC<{
  protectFirstLastLines: boolean
  value: string
  clean: string
  onChange: (value: string, editor: any) => void
  editorDidMount: (value: string, editor: any) => void
  height?: string
  width?: string
  theme?: string
  language?: string
  options?: { [key: string]: any }
}> = ({
  value,
  clean,
  onChange,
  editorDidMount,
  protectFirstLastLines,
  ...props
}) => {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      monaco.init()
    }
  }, [])

  const previousValue = React.useRef(value)
  const rEditor = React.useRef<any>()
  const debouncedOnChange = React.useMemo(
    () =>
      debounce((event, value) => {
        previousValue.current = value
        onChange(event, value)
      }, DEFAULT_UPDATE_DEBOUNCE_DELAY),
    [onChange]
  )

  React.useEffect(() => {
    const editor = rEditor.current
    const previous = previousValue.current

    if (value !== previous && editor) {
      editor.setValue(value)
    }
    previousValue.current = value
  }, [value])

  React.useEffect(() => {
    const editor = rEditor.current
    if (editor) {
      editor.getAction("editor.action.formatDocument").run()
    }
  }, [clean])

  const handleEditorDidMount = (getValue, editor) => {
    rEditor.current = editor
    editor.setValue(previousValue.current)
    editor.onDidChangeModelContent((ev) => {
      const currentValue = editor.getValue()

      // End custom

      if (currentValue !== previousValue.current) {
        debouncedOnChange(ev, currentValue)
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

  return <Editor value="" editorDidMount={handleEditorDidMount} {...props} />
}

export default CodeEditor
