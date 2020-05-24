/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"

import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"
import {
  createConfig,
  createStateDesign,
  useStateDesign,
} from "@state-designer/react"
import lightTheme from "prism-react-renderer/themes/github"

import * as snippets from "./snippets"

// function alert(message) {
//   if (window !== undefined) {
//     window.alert(message)
//   }
// }

const counter = createConfig({
  data: { count: 0 },
  on: {
    INCREASED: (data) => data.count++,
    DECREASED: (data) => data.count--,
  },
})

const toggle = createConfig({
  initial: "unchecked",
  states: {
    checked: {
      on: {
        TOGGLED: { to: "unchecked" },
      },
    },
    unchecked: {
      on: {
        TOGGLED: { to: "checked" },
      },
    },
  },
})

export const isBrowser = () => typeof window !== "undefined"

const LiveView = ({ snippet = "" }) => {
  const [updates, setUpdates] = React.useState(0)
  const [code, setCode] = React.useState(snippets[snippet] || snippet)

  function saveCodeToLocalStorage(code) {
    isBrowser() && window.localStorage.setItem(`live_view_${snippet}`, code)
  }

  function resetCode(code) {
    isBrowser() &&
      window.localStorage.setItem(`live_view_${snippet}`, snippets[snippet])
    setUpdates(updates + 1)
    setCode(snippets[snippet])
  }

  React.useEffect(() => {
    if (isBrowser()) {
      const localCode =
        (isBrowser() && window.localStorage.getItem(`live_view_${snippet}`)) ||
        snippets[snippet]

      if (localCode !== undefined) {
        setCode(localCode)
      }
    }
  }, [snippet])

  return (
    <div
      className={`live-view light`}
      key={updates}
      sx={{
        border: "1px solid #d8dde4",
        borderRadius: 4,
        overflow: "hidden",
        marginTop: "1.5em",
        marginBottom: "2em",
        fontWeight: "code",
        fontSize: [16, 14],
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
        scope={{
          useStateDesign,
          createStateDesign,
          createConfig,
          toggle,
          counter,
        }}
        style={{
          overflowX: "scroll",
        }}
      >
        <div style={{ position: "relative" }}>
          <button
            className="small"
            style={{ position: "absolute", top: 4, right: 4, zIndex: 8888 }}
            onClick={resetCode}
          >
            Reset
          </button>
          <LivePreview
            className="container"
            style={{
              padding: "32px 16px",
            }}
          ></LivePreview>
        </div>
        <LiveEditor
          sx={{
            borderTop: "1px solid #d8dde4",
            overflowX: "scroll",
            backgroundColor: "#f6f8fa",
            tabSize: 2,
            overflow: "scroll",
            scroll: "auto",
          }}
          style={{
            fontFamily: "'Fira Code', monospace",
            fontWeight: 500,
          }}
        />
        <LiveError
          style={{
            fontSize: 12,
            margin: 0,
            padding: 16,
            borderTop: "1px solid #d8dde4",
            backgroundColor: "#fbf7f8",
          }}
        />
      </LiveProvider>
    </div>
  )
}

export default LiveView
