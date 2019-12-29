import React from "react"
import { Flex, Text, Box } from "rebass"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"

export enum Fences {
  ResultArgs = `(data) => `,
  FunctionArgs = `(data, payload, result) => `,
  Start = `{
  `,
  End = `
}`
}

export interface Props {
  readOnly?: boolean
  value?: string
  highlight?: boolean
  startWith?: string
  endWith?: string
  error?: string
  onChange?: (code: string) => void
  style?: React.CSSProperties
}

export const CodeEditor: React.FC<Props> = ({
  value = "",
  error,
  startWith,
  highlight: shouldHighlight = true,
  endWith,
  style = {},
  onChange = () => {},
  readOnly = false
}) => {
  function textIn(text: string) {
    let t = text

    if (startWith !== undefined) {
      t = startWith + t
    }

    if (endWith !== undefined) {
      t = t + endWith
    }
    return t
  }

  function textOut(text: string) {
    let t = text

    if (startWith !== undefined) {
      t = t.split(startWith)[1]
    }

    if (endWith !== undefined) {
      t = t.split(endWith)[0]
    }
    return t
  }

  return (
    <Box
      sx={{
        position: "relative",
        border: "1px solid #ccc",
        borderRadius: 4,
        overflow: "hidden",
        ...style
      }}
    >
      <Editor
        value={textIn(value)}
        onValueChange={code => onChange(textOut(code || ""))}
        readOnly={readOnly}
        highlight={code =>
          shouldHighlight ? highlight(code, languages.js) : code
        }
        padding={8}
        insertSpaces={false}
        style={{
          backgroundColor: "#f7f8fa",
          fontWeight: 500,
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          lineHeight: 2
        }}
      />
      {error && (
        <Flex
          alignItems="center"
          p={2}
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 32,
            width: "100%",
            background: "#ff5087"
          }}
        >
          <Text>{error}</Text>
        </Flex>
      )}
    </Box>
  )
}
