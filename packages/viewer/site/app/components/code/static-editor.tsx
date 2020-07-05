// @refresh reset
import * as React from "react"
import { Box, useColorMode } from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import { codeX } from "../layout"
import { debounce } from "lodash"
import CodeEditor from "./code-editor"
import { useHighlights } from "./monaco"
import { StaticsEditorState } from "../../states"

const StaticEditor: React.FC<{ readOnly: boolean }> = ({ readOnly }) => {
  const local = useStateDesigner(StaticsEditorState)
  const rEditor = React.useRef<any>(null)
  const [colorMode] = useColorMode()

  useHighlights(rEditor, local.data.dirty)

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
    editor.onDidFocusEditorText(() => local.send("FOCUSED"))
    editor.onDidBlurEditorText(() => local.send("BLURRED"))

    // Save event
    editor.onKeyDown((e: KeyboardEvent) => {
      if (e.metaKey && e.code === "KeyS") {
        e.preventDefault()
        isAutoFormatting.current = true
        local.send("QUICK_SAVED")
      }
    })
  }, [])

  const isAutoFormatting = React.useRef(false)

  return (
    <Box sx={{ overflow: "hidden", height: "100%", width: "100%" }}>
      <CodeEditor
        theme={colorMode === "dark" ? "dark" : "light"}
        height="100%"
        width="100%"
        value={local.data.dirty}
        clean={local.data.clean}
        validate={(code) =>
          !!code.match(/function getStatic\(\) \{\n.*?\n\}$/gs)
        }
        onChange={(_, code, editor) => {
          if (isAutoFormatting.current) {
            isAutoFormatting.current = false
          } else {
            local.send("CHANGED_CODE", { code })
          }
        }}
        language="javascript"
        options={{
          lineNumbers: false,
          showUnused: false,
          suggest: false,
          rulers: false,
          quickSuggestions: false,
          scrollBeyondLastLine: false,
          fontFamily: "Fira Code",
          fontSize: 13,
          fontWeight: 400,
          readOnly,
          minimap: { enabled: false },
          smoothScrolling: true,
          lineDecorationsWidth: 4,
          fontLigatures: true,
          cursorBlinking: "smooth",
        }}
        editorDidMount={setupMonaco}
      />
    </Box>
  )
}

export default React.memo(StaticEditor)
