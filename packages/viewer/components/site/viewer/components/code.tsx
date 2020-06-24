import * as React from "react"
import { Box, useColorMode } from "theme-ui"
import Column from "./column"
import { editor } from "../states/editor"
import { useStateDesigner } from "@state-designer/react"
import { codeX } from "./layout"
import debounce from "lodash.debounce"

import Editor, { monaco } from "@monaco-editor/react"

const Code: React.FC = (props) => {
  const local = useStateDesigner(editor)

  const [colorMode] = useColorMode()

  const rEditor = React.useRef<any>(null)

  React.useEffect(() => {
    function updateMonacoLayout() {
      const editor = rEditor.current
      if (!!editor) {
        editor.layout()
      }
    }

    return codeX.onChange(debounce(updateMonacoLayout, 60))
  }, [])

  function setupMonaco(_, editor) {
    rEditor.current = editor

    editor.changeViewZones((changeAccessor) => {
      const domNode = document.createElement("div")
      changeAccessor.addZone({
        afterLineNumber: 0,
        heightInLines: 1,
        domNode: domNode,
      })
    })

    editor.onDidFocusEditorText(() => local.send("STARTED_EDITING"))

    editor.onDidBlurEditorText(() => local.send("STOPPED_EDITING"))

    editor.onKeyDown((e) => {
      if (e.metaKey && e.code === "KeyS") {
        e.preventDefault()
        local.send("QUICK_SAVED")
      }
    })

    editor.onKeyUp((e) => {
      if (e.code === "Escape" && local.can("CANCELLED")) {
        e.preventDefault()
        local.send("CANCELLED")
        editor.blur()
      }
    })

    editor.onDidChangeModelContent((ev) => {
      const currentValue = editor.getValue()

      if (!currentValue.startsWith(`createState({\n`)) {
        editor.trigger(currentValue, "undo")
        return
      }

      if (!currentValue.endsWith(`\n})\n`)) {
        editor.trigger(currentValue, "undo")
        return
      }
    })
  }

  return (
    <Column
      sx={{
        gridArea: "code",
        position: "relative",
        p: 0,
        borderLeft: "outline",
        borderColor: "border",
      }}
    >
      <Box sx={{ height: "100%", width: "100%" }}>
        <ControlledEditor
          theme={colorMode === "dark" ? "dark" : "light"}
          value={local.data.dirty}
          height="100%"
          width="100%"
          clean={local.data.clean}
          onChange={(_, code) => {
            local.send("CHANGED_CODE", { code })
          }}
          language="javascript"
          options={{
            automaticLayout: true,
            lineNumbers: false,
            showUnused: false,
            suggest: false,
            rulers: false,
            quickSuggestions: false,
            scrollBeyondLastLine: false,
            fontFamily: "Fira Code",
            minimap: {
              enabled: false,
            },
            lineDecorationsWidth: 4,
          }}
          editorDidMount={setupMonaco}
        />
      </Box>
    </Column>
  )
}
export default Code

const DEFAULT_UPDATE_DEBOUNCE_DELAY = 100

const ControlledEditor: React.FC<{
  value: string
  clean: string
  onChange: (value: string, editor: any) => void
  editorDidMount: (value: string, editor: any) => void
  height?: string
  width?: string
  theme?: string
  language?: string
  options?: { [key: string]: any }
}> = ({ value, clean, onChange, editorDidMount, ...props }) => {
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

      // Custom

      if (!currentValue.startsWith(`createState({\n`)) {
        editor.trigger(currentValue, "undo")
        return
      }

      if (!currentValue.endsWith(`\n})\n`)) {
        editor.trigger(currentValue, "undo")
        return
      }

      // End custom

      if (currentValue !== previousValue.current) {
        debouncedOnChange(ev, currentValue)
      }
    })

    editorDidMount(getValue, editor)
  }

  return <Editor value="" editorDidMount={handleEditorDidMount} {...props} />
}
