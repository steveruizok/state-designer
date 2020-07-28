import * as React from "react"
import { S } from "@state-designer/react"
import { Highlights } from "../../states/highlights"
import { monaco } from "@monaco-editor/react"
import prettier from "prettier/standalone"
import parser from "prettier/parser-typescript"

export function useHighlights(rEditor: any, code: string) {
  const rPrevious = React.useRef<any[]>([])

  const highlightRanges = React.useCallback(
    async (code: string, search: string | undefined, scrollToLine = false) => {
      const previous = rPrevious.current
      const editor = rEditor.current
      if (editor === null) return

      if (search === null) {
        rPrevious.current = editor.deltaDecorations(previous, [])
      } else {
        const ranges = await getHighlightRanges(code, search + ":")

        if (scrollToLine && ranges.length > 0) {
          editor.revealLineInCenter(ranges[0].range.startLineNumber - 1, 0)
        }

        rPrevious.current = editor.deltaDecorations(previous, ranges)
      }
    },
    []
  )

  React.useEffect(() => {
    return Highlights.onUpdate(
      async ({ data: { state, event, scrollToLine } }) => {
        highlightRanges(code, state || event, scrollToLine)
      }
    )
  }, [code])
}

/* --------------- Monaco Rangefinding -------------- */

let m: any

export async function initMonaco() {
  // This could be worse! (But it could be better)
  if (m === undefined && typeof window !== "undefined") {
    m = await monaco.init()

    const typescript = m.languages.typescript
    const compilerOptions = {
      noEmit: true,
      target: typescript.ScriptTarget.ES2018,
      allowJs: true,
      allowNonTsExtensions: true,
      allowSyntheticDefaultImports: true,
      alwaysStrict: true,
      jsx: "React",
      moduleResolution: typescript.ModuleResolutionKind.NodeJs,
      module: typescript.ModuleKind.CommonJS,
      resolveJsonModule: true,
      typeRoots: ["node_modules/@types"],
    }
    typescript.typescriptDefaults.setCompilerOptions(compilerOptions)
    typescript.javascriptDefaults.setCompilerOptions(compilerOptions)
    typescript.typescriptDefaults.setEagerModelSync(true)
    typescript.javascriptDefaults.setEagerModelSync(true)

    // setup prettier formatter
    const prettierFormatter = {
      provideDocumentFormattingEdits(model) {
        try {
          const text = prettier.format(model.getValue(), {
            parser: "typescript",
            plugins: [parser],
            semi: false,
            trailingComma: "es5",
            tabWidth: 2,
          })

          const range = model.getFullModelRange()

          return [
            {
              range,
              text,
            },
          ]
        } catch (e) {
          // Suppress error
          return []
        }
      },
    }
    m.languages.registerDocumentFormattingEditProvider(
      "javascript",
      prettierFormatter
    )
    m.languages.registerDocumentFormattingEditProvider(
      "typescript",
      prettierFormatter
    )
  }
}

export async function getHighlightRanges(code: string, searchString: string) {
  const lines = code.split("\n")
  const ranges: number[][] = []

  // Root state is the entire object
  if (searchString === "root:") {
    ranges[0] = [0, 1, lines.length - 1, 1]
  } else {
    // We need to search every line of code for an instance of the search string,
    // make a note of where the range it begins, and then search for the end of the
    // string. We'll figure out the regex later — for now, we'll use the number of
    // white space characters at the start of the line. As long as the code is
    // formatted, that number should be the same at both the start and end of a
    // highlight range.
    let rangeIndex = 0,
      startSpaces = 0,
      state = "searchingForStart"

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (state === "searchingForStart") {
        if (line.includes(" " + searchString)) {
          startSpaces = line.search(/\S/)
          state = "searchingForEnd"
          ranges[rangeIndex] = [i + 1, 1]
        }
      } else if (state === "searchingForEnd") {
        if (i === 0) continue
        const spaces = line.search(/\S/)
        const range = ranges[rangeIndex]

        if (spaces <= startSpaces) {
          range.push(spaces < startSpaces || i === range[0] ? i : i + 1)
          range.push(1)
          rangeIndex++
          state = "searchingForStart"
        }
      }
    }
  }

  return ranges.map((range) => ({
    range: new m.Range(...range),
    options: {
      isWholeLine: true,
      inlineClassName: "inlineCodeHighlight",
      marginClassName: "lineCodeHighlight",
    },
  }))
}
