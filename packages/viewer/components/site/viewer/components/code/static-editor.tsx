// @refresh reset
import * as React from "react"
import { useColorMode } from "theme-ui"
import { createDesign, useStateDesigner } from "@state-designer/react"
import { codeX } from "../layout"
import { debounce } from "lodash"
import CodeEditor from "./code-editor"

type Data = {
  oid: string
  uid: string
  pid: string
  isOwner: boolean
  clean: string
  dirty: string
  error: string
  element: any
}

const data: Data = {
  oid: "",
  uid: "",
  pid: "",
  isOwner: false,
  clean: "",
  dirty: "",
  error: "",
  element: undefined,
}

createDesign({
  data,
  initial: "idle",
  states: {
    idle: {
      on: { FOCUSED_EDITOR: { to: "editing" } },
    },
    editing: {
      initial: {
        if: "codeMatchesClean",
        to: "match",
        else: {
          if: "errorIsClear",
          to: "valid",
          else: { to: "invalid" },
        },
      },
      states: {
        match: {
          on: { BLURRED_EDITOR: { to: "idle" } },
        },
        valid: {
          on: {
            QUICK_SAVED_CHANGES: ["saveDirtyToClean", { to: "editing" }],
            SAVED_CHANGES: ["saveDirtyToClean", { to: "idle" }],
          },
        },
        invalid: {},
      },
      on: {
        CANCELLED_CHANGES: { do: ["resetCode", "clearError"], to: "idle" },
        CHANGED_CODE: ["setDirty", "setError", { to: "editing" }],
      },
    },
  },
  on: {
    SET_CODE: ["refreshCode"],
    SET_CLEAN: ["refreshCode"],
  },
  conditions: {
    codeMatchesClean(data) {
      return data.dirty === data.clean
    },
    errorIsClear(data) {
      return data.error === ""
    },
    isOwner(data) {
      return data.isOwner
    },
  },
  actions: {
    refreshCode(d, { code }) {
      d.clean = code
      d.dirty = code
    },
    setDirty(data, { code }) {
      data.dirty = code
    },
    resetCode(data) {
      data.dirty = data.clean
    },
    saveDirtyToClean(data) {
      data.clean = data.dirty
    },
    clearError(data) {
      data.error = ""
    },
    setError(data) {
      let err = ""
      data.error = err
    },
  },
})

const ReactEditor: React.FC = (props) => {
  const local = useStateDesigner({
    data: { dirty: "", clean: "" },
  })

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

    // Focus / Blur events
    editor.onDidFocusEditorText(() => local.send("FOCUSED_EDITOR"))
    editor.onDidBlurEditorText(() => local.send("BLURRED_EDITOR"))

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
      theme={colorMode === "dark" ? "dark" : "light"}
      value={local.data.dirty}
      height="100%"
      width="100%"
      clean={local.data.clean}
      onChange={(_, code, editor) => {
        if (!code.startsWith(`function Component() {\n`)) {
          editor.trigger(code, "undo")
          return
        }

        if (!code.endsWith(`\n}`)) {
          editor.trigger(code, "undo")
          return
        }

        local.send("CHANGED_CODE", { code })

        return
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
        readOnly: local.isIn("guest"),
        minimap: {
          enabled: false,
        },
        jsx: "react",
        smoothScrolling: true,
        lineDecorationsWidth: 4,
        fontLigatures: true,
        cursorBlinking: "smooth",
      }}
      editorDidMount={setupMonaco}
    />
  )
}

export default ReactEditor
