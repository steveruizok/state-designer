// @refresh reset
import * as React from "react"
import { debounce } from "lodash"
import { initMonaco } from "lib/monaco"
import Editor from "@monaco-editor/react"
import { styled, IconButton } from "components/theme"
import { Save, RefreshCcw, AlertCircle } from "react-feather"

interface CodeProps {
  children: React.ReactNode
}

export default function Code({ children }: CodeProps) {
  return (
    <CodeContainer>
      <Tabs>
        <TabButton state="active">State</TabButton>
        <TabButton state="inactive">View</TabButton>
        <TabButton state="inactive">Static</TabButton>
      </Tabs>
      <CodeEditor
        value={"some code"}
        clean={"some code"}
        onSave={(code: string) => {}}
        canSave={() => false}
        onChange={(value: string) => {}}
        editorDidMount={(value: string, editor: any) => {}}
      />
      <Status>
        <ErrorMessage>
          <AlertCircle size={16} />
          ...
        </ErrorMessage>
        <IconButton>
          <RefreshCcw />
        </IconButton>
        <IconButton>
          <Save />
        </IconButton>
      </Status>
      {children}
    </CodeContainer>
  )
}

const CodeContainer = styled.div({
  position: "relative",
  gridArea: "code",
  display: "grid",
  gridTemplateRows: `40px 1fr 40px`,
  borderLeft: "2px solid $border",
})

const Tabs = styled.div({
  display: "flex",
  borderBottom: "2px solid $border",
})

const TabButton = styled.button({
  cursor: "pointer",
  color: "$text",
  fontFamily: "$body",
  fontWeight: "$2",
  display: "flex",
  flexGrow: 1,
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  background: "transparent",
  border: "none",
  outline: "none",
  "&:hover": {
    opacity: 1,
    bg: "$muted",
  },
  variants: {
    state: {
      active: {
        opacity: 1,
      },
      inactive: {
        opacity: 0.5,
      },
    },
  },
})

const Status = styled.div({
  borderTop: "2px solid $border",
  display: "flex",
  alignItems: "center",
})

const ErrorMessage = styled.div({
  px: "$1",
  flexGrow: 2,
  display: "flex",
  alignItems: "center",
  fontSize: "$0",
  color: "$Red",
  overflow: "hidden",
  whiteSpace: "nowrap",
  borderRadius: 4,
  svg: {
    mr: "$1",
  },
})

const CodeEditor: React.FC<{
  value: string
  clean: string
  onSave: (code: string) => void
  canSave: () => boolean
  onChange: (value: string) => void
  editorDidMount: (value: string, editor: any) => void
  validate?: (code: string) => boolean
  fontSize?: number
  readOnly?: boolean
  height?: string
  width?: string
  theme?: string
  language?: string
}> = ({
  value,
  clean,
  validate,
  canSave,
  onChange,
  onSave,
  editorDidMount,
  fontSize = 13,
  readOnly = false,
  ...props
}) => {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      initMonaco()
    }
  }, [])

  const rPreviousValue = React.useRef(value)
  const rEditor = React.useRef<any>()

  // We might be updating from firebase changes
  React.useEffect(() => {
    const editor = rEditor.current
    if (!editor) return
    const currentValue = editor.getValue()

    // We've updated from firebase changes
    if (clean !== currentValue) {
      editor.setValue(clean)
    } else {
      // We've updated from saved local changes, so noop
    }
  }, [clean])

  const handleEditorDidMount = (getValue, editor) => {
    rEditor.current = editor
    const model = editor.getModel()

    model.setValue(value)
    model.updateOptions({ tabSize: 2 })

    // Update current value when the model changes
    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue()

      const previousValue = rPreviousValue.current
      const isValid = validate ? validate(currentValue) : true

      if (isValid) {
        onChange(currentValue)
        rPreviousValue.current = currentValue
      } else {
        // User's change was invalid, so undo the change
        if (currentValue === previousValue) return
        const model = editor.getModel()
        model.undo()
      }
    })

    // Add a buffer to the top of the editor
    editor.changeViewZones((changeAccessor) => {
      const domNode = document && document.createElement("div")
      changeAccessor.addZone({
        afterLineNumber: 0,
        heightInLines: 1,
        domNode: domNode,
      })
    })

    // Save event
    editor.onKeyDown(async (e: KeyboardEvent) => {
      if (e.metaKey && e.code === "KeyS") {
        e.preventDefault()

        let currentValue = editor.getValue()

        const isValid = validate ? validate(currentValue) : true

        if (isValid && canSave()) {
          // Run prettier
          await editor.getAction("editor.action.formatDocument").run()

          // Then update previous value
          currentValue = editor.getValue()
          rPreviousValue.current = currentValue

          // And run onSave
          onSave(currentValue)
        }
      }
    })

    editorDidMount(getValue, editor)
  }

  return (
    <Editor
      {...props}
      language="javascript"
      theme="light"
      options={{
        fontSize,
        readOnly,
        showUnused: false,
        quickSuggestions: false,
        fontFamily: "Fira Code",
        fontWeight: "normal",
        minimap: { enabled: false },
        smoothScrolling: true,
        lineDecorationsWidth: 4,
        fontLigatures: true,
        cursorBlinking: "smooth",
        lineNumbers: "off",
      }}
      editorDidMount={handleEditorDidMount}
    />
  )
}
