import * as React from "react"
import { getHighlightRanges } from "lib/monaco"

export function useHighlights(rEditor: any, code: string) {
  const rPrevious = React.useRef<any[]>([])

  const highlightRanges = React.useCallback(
    async (code: string, search: string | undefined, scrollToLine = false) => {
      const editor = rEditor.current
      if (editor === null) return

      const previous = rPrevious.current

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

  // Subscribe to highlights state
  React.useEffect(() => {
    // return Highlights.onUpdate(
    //   async ({ data: { state, event, scrollToLine } }) => {
    //     highlightRanges(code, state || event, scrollToLine)
    //   }
    // )
  }, [code])
}
