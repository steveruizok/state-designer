import * as React from "react"
import { useColorMode } from "theme-ui"
import { editor } from "../../states/editor"
import { useStateDesigner } from "@state-designer/react"
import { codeX } from "../layout"
import { debounce } from "lodash"
import CodeEditor from "./code-editor"
import { getHighlightRanges } from "./utils"

const StateEditor: React.FC = (props) => {
  const local = useStateDesigner(editor)
  const rEditor = React.useRef<any>(null)
  const rHighlights = React.useRef<any>([])
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

  // Highlight ranges of code based on current highlight
  async function highlightRanges() {
    const editor = rEditor.current
    if (editor === null) return

    const { state, event } = local.data.highlight

    let searchString = event || state

    if (!searchString) {
      rHighlights.current = editor.deltaDecorations(rHighlights.current, [])
    } else {
      const ranges = await getHighlightRanges(
        local.data.dirty,
        searchString + ":"
      )

      rHighlights.current = editor.deltaDecorations(rHighlights.current, ranges)
    }
  }

  React.useEffect(() => {
    highlightRanges()
  }, [local.data.highlight])

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
      protectFirstLastLines={true}
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
