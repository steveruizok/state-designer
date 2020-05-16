import * as React from "react"
import { useColorMode } from "theme-ui"

import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"
import { useStateDesigner } from "@state-designer/react"
import lightTheme from "prism-react-renderer/themes/github"

export const LiveView = ({ code = `` }) => {
  const isDark = false
  const border = isDark ? "1px solid #333" : "1px solid #ced4de"

  return (
    <div
      style={{
        border,
        borderRadius: 2,
        overflow: "hidden",
        marginBottom: "1.5em",
      }}
    >
      <LiveProvider
        language="jsx"
        theme={lightTheme}
        code={code}
        scope={{ useStateDesigner }}
        style={{
          overflowX: "scroll",
        }}
      >
        <LivePreview
          className={`live-view ${isDark ? "dark" : "light"}`}
          style={{
            padding: 16,
            backgroundColor: isDark ? "rgba(255, 255, 255, .025" : "#fff",
          }}
        />
        <LiveEditor
          style={{
            fontSize: 16,
            borderTop: border,
            overflowX: "scroll",
            backgroundColor: isDark
              ? "rgba(255, 255, 255, .025"
              : "rgba(0,0,0, .025",

            tabSize: 2,
            fontFamily: "'Fira Code', monospace",
            fontWeight: 500,
            fontSize: 14,
            borderRadius: 4,
            overflow: "scroll",
            scroll: "auto",
          }}
        />
        <LiveError
          style={{
            fontSize: 12,
            margin: 0,
            padding: 16,
            borderTop: border,
            backgroundColor: isDark ? "#352226" : "#fbf7f8",
          }}
        />
      </LiveProvider>
    </div>
  )
}
