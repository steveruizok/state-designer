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
      p={1}
      sx={{
        width: "100%",
        position: "relative",
        border: "1px solid #ccc",
        borderRadius: 4,
        ...style
      }}
    >
      <Editor
        value={textIn(value)}
        onValueChange={code => onChange(textOut(code || ""))}
        readOnly={readOnly}
        highlight={code => highlight(code, languages.js)}
        padding={4}
        insertSpaces={false}
        style={{
          backgroundColor: "#2b2734",
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
            height: 40,
            width: "100%",
            background: "rgba(255, 255, 255, .1)"
          }}
        >
          <Text>{error}</Text>
        </Flex>
      )}
    </Box>
  )
}
