import * as React from "react"

import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"
import {
  createConfig,
  createStateDesigner,
  useStateDesigner,
} from "@state-designer/react"
import lightTheme from "prism-react-renderer/themes/github"

import * as snippets from "./snippets"

export const LiveView = ({ snippet = "" }) => {
  const isDark = false
  const border = isDark ? "1px solid #333" : "1px solid #ced4de"

  const [updates, setUpdates] = React.useState(0)

  const code = localStorage.getItem(`live_view_${snippet}`) || snippets[snippet]

  function saveCodeToLocalStorage(code) {
    localStorage.setItem(`live_view_${snippet}`, code)
  }

  function resetCode(code) {
    localStorage.setItem(`live_view_${snippet}`, snippets[snippet])
    setUpdates(updates + 1)
  }

  return (
    <div
      className={`live-view ${isDark ? "dark" : "light"}`}
      key={updates}
      style={{
        border,
        borderRadius: 4,
        overflow: "hidden",
        marginTop: "1.5em",
        marginBottom: "2em",
      }}
    >
      <LiveProvider
        language="jsx"
        theme={lightTheme}
        code={code}
        transformCode={(c) => {
          saveCodeToLocalStorage(c)
          return c
        }}
        scope={{ useStateDesigner, createStateDesigner, createConfig }}
        style={{
          overflowX: "scroll",
        }}
      >
        <div style={{ position: "relative" }}>
          <button
            className="small"
            style={{ position: "absolute", top: 4, right: 4 }}
            onClick={resetCode}
          >
            Reset
          </button>
          <LivePreview
            style={{
              padding: "32px 16px",
              backgroundColor: isDark ? "rgba(255, 255, 255, .025" : "#fff",
            }}
          ></LivePreview>
        </div>
        <LiveEditor
          style={{
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
