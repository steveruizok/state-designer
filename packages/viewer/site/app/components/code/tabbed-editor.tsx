// @refresh reset
import * as React from "react"
import { Box, useColorMode, Button } from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import { codeX } from "../layout"
import { debounce } from "lodash"
import CodeEditor from "./code-editor"
import { JsxEditorState } from "../../states"
import { monaco } from "@monaco-editor/react"

const JsxEditor: React.FC<{ readOnly: boolean }> = ({ readOnly }) => {
  const local = useStateDesigner(JsxEditorState)
  const rMonaco = React.useRef<any>(null)
  const rEditor = React.useRef<any>(null)
  const [colorMode] = useColorMode()

  const tabs = useStateDesigner({
    data: {
      activeIndex: 1,
      models: [],
    },
    initial: "loading",
    states: {
      loading: {
        async: {
          await: async () => await monaco.init(),
          onReject: () => console.log("oops"),
          onResolve: {
            do: "createModels",
            to: "loaded",
          },
        },
      },
      loaded: {
        onEnter: () => console.log("loaded"),
      },
    },
    on: {
      CHANGED_TABS: "setTab",
      REMOVED_TAB: "removeTab",
    },
    actions: {
      createModels(data, payload, monaco) {
        rMonaco.current = monaco
        data.models = [
          {
            name: "App",
            model: monaco.editor.createModel(
              "function App() {\n\treturn <div>Hello world</div>\n}",
              "javascript"
            ),
            state: null,
          },
          {
            name: "Todo",
            model: monaco.editor.createModel(
              "function Todo() {\n\treturn <div>Whattup world</div>\n}",
              "javascript"
            ),
            state: null,
          },
        ]
      },
      setTab(data, { index }) {
        const editor = rEditor.current
        const current = data.models[data.activeIndex]
        const next = data.models[index]

        current.state = editor.saveViewState()

        data.activeIndex = index

        editor.setModel(next.model)
        if (next.state) {
          editor.restoreViewState(next.state)
        }
      },
      removeTab(data, { index }) {
        data.models.splice(index, 1)
      },
      addTab(data, { index }) {
        const monaco = rMonaco.current
        if (monaco === undefined) return

        data.models.push({
          name: "Todo",
          model: monaco.editor.createModel(
            "function Component() {\n\treturn <div></div>\n}",
            "javascript"
          ),
          state: null,
        })
      },
      updateTab(data, { index, code }) {
        data.models[index].model
      },
    },
  })

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
    editor.onDidFocusEditorText(() => local.send("STARTED_EDITING"))
    editor.onDidBlurEditorText(() => local.send("STOPPED_EDITING"))

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
      <Box
        sx={{
          height: 44,
          width: "100%",
          bg: "muted",
          borderBottom: "outline",
          borderColor: "border",
        }}
      >
        {tabs.data.models.map((model, index) => (
          <Button
            key={index}
            onClick={() => tabs.send("CHANGED_TABS", { index })}
          >
            {model.name}
          </Button>
        ))}
      </Box>
      <CodeEditor
        theme={colorMode === "dark" ? "dark" : "light"}
        value={local.data.dirty}
        height="100%"
        width="100%"
        clean={local.data.clean}
        validate={(code) =>
          !!code.match(/function Component\(\) \{\n.*?\n\}$/gs)
        }
        onChange={(_, code) => {
          if (isAutoFormatting.current) {
            isAutoFormatting.current = false
          } else {
            local.send("CHANGED_CODE", { code })
          }

          return code
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
    </Box>
  )
}

export default React.memo(JsxEditor)
