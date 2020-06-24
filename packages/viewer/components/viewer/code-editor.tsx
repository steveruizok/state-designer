import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { codeEditor } from "./index"
import { Box, Grid } from "theme-ui"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"

export const CodeEditor: React.FC<{}> = () => {
  const state = useStateDesigner(codeEditor)

  return (
    <Box
      sx={{
        fontFamily: "monospace",
        p: 3,
        borderRadius: 12,
        backgroundColor: "#000",
        height: "100%",
        overflow: "scroll",
      }}
    >
      <Editor
        value={state.data.dirty}
        highlight={(code) => {
          return highlight(code, languages.js)
        }}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
        }}
        onValueChange={(code) => state.send("CHANGED_CODE", code)}
        onFocus={() => state.send("STARTED_EDITING")}
        onBlur={() => state.send("STOPPED_EDITING")}
        onKeyDown={(e) => {
          if (e.metaKey && e.key === "s") {
            e.preventDefault()
            state.send("QUICK_SAVED")
          }
        }}
        onKeyUp={(e) => {
          if (e.key === "Escape" && state.can("CANCELLED")) {
            e.preventDefault()
            state.send("CANCELLED")
            e.currentTarget.blur()
          }
        }}
      />
    </Box>
  )
}
