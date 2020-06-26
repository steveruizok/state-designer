import { monaco } from "@monaco-editor/react"

let m: any

export async function initMonaco() {
  if (m === undefined && typeof window !== "undefined") {
    m = await monaco.init()
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
        if (line.includes(searchString)) {
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

  if (m === undefined) await initMonaco()

  return ranges.map((range) => ({
    range: new m.Range(...range),
    options: {
      isWholeLine: true,
      inlineClassName: "inlineCodeHighlight",
      marginClassName: "lineCodeHighlight",
    },
  }))
}
