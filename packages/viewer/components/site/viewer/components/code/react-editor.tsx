import * as React from "react"
import { useColorMode } from "theme-ui"
import { presentation } from "../../states/presentation"
import { useStateDesigner } from "@state-designer/react"
import { codeX } from "../layout"
import debounce from "lodash.debounce"
import CodeEditor from "./code-editor"

const StateEditor: React.FC = (props) => {
  const local = useStateDesigner(presentation)
  const rEditor = React.useRef<any>(null)
  const [colorMode] = useColorMode()

  // Update the code editor's layout
  function updateMonacoLayout() {
    const editor = rEditor.current
    if (!!editor) {
      editor.layout()
    }
  }

  React.useEffect(() => {
    return codeX.onChange(debounce(updateMonacoLayout, 60))
  }, [])

  // Set up the monaco instance
  const setupMonaco = React.useCallback((_, editor) => {
    rEditor.current = editor

    // Focus / Blur events
    editor.onDidFocusEditorText(() => local.send("STARTED_EDITING"))
    editor.onDidBlurEditorText(() => local.send("STOPPED_EDITING"))

    // Save event
    editor.onKeyDown((e: KeyboardEvent) => {
      if (e.metaKey && e.code === "KeyS") {
        e.preventDefault()
        local.send("QUICK_SAVED")
      }
    })
  }, [])

  return (
    <CodeEditor
      protectFirstLastLines={false}
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
        fontSize: 13,
        fontWeight: 400,
        readOnly: local.isIn("guest"),
        minimap: {
          enabled: false,
        },
        lineDecorationsWidth: 4,
      }}
      editorDidMount={setupMonaco}
    />
  )
}

export default StateEditor
