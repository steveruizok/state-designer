// @refresh reset
import * as React from "react"
import { Box, useColorMode } from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import { codeX } from "../layout"
import { debounce } from "lodash"
import CodeEditor from "./code-editor"
import { StaticsEditorState } from "../../states"

const StaticEditor: React.FC<{ readOnly: boolean }> = ({ readOnly }) => {
  const local = useStateDesigner(StaticsEditorState)
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

  React.useEffect(() => {
    function updateLayout() {
      debounce(updateMonacoLayout, 60)
    }
    window.addEventListener("resize", updateLayout)
    return () => window.removeEventListener("resize", updateLayout)
  }, [])

  // Set up the monaco instance
  const setupMonaco = React.useCallback((_, editor) => {
    rEditor.current = editor
  }, [])

  return (
    <Box sx={{ overflow: "hidden", height: "100%", width: "100%" }}>
      <CodeEditor
        theme={colorMode === "dark" ? "dark" : "light"}
        height="100%"
        width="100%"
        value={local.data.dirty}
        clean={local.data.clean}
        validate={(code) => {
          return !!code.match(/function getStatic\(\) \{\n.*?\}(\n?)$/gs)
        }}
        canSave={() => local.isIn("valid")}
        onSave={(code) => local.send("QUICK_SAVED", { code })}
        onChange={(code) => local.send("CHANGED_CODE", { code })}
        language="javascript"
        options={{
          lineNumbers: false,
          showUnused: false,
          suggest: false,
          rulers: false,
          quickSuggestions: false,
          fontFamily: "Fira Code",
          fontSize: 13,
          fontWeight: 400,
          readOnly,
          tabSize: 2,
          minimap: { enabled: false },
          smoothScrolling: true,
          lineDecorationsWidth: 4,
          fontLigatures: true,
          cursorBlinking: "smooth",
          allowJs: true,
          allowSyntheticDefaultImports: true,
          alwaysStrict: true,
          jsx: "React",
          jsxFactory: "React.createElement",
        }}
        editorDidMount={setupMonaco}
      />
    </Box>
  )
}

export default React.memo(StaticEditor)
