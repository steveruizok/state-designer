import * as React from "react"
import { Grid } from "theme-ui"
import DragHandleVertical from "./drag-handle-vertical"
import DragHandleHorizontal from "./drag-handle-horizontal"
import { motionValue } from "framer-motion"

let BASE_CODE_COL_WIDTH = 420
let BASE_CONTENT_COL_WIDTH = 260
let codeOffset = 0
let contentOffset = 0

if (window.localStorage !== undefined) {
  const baseCodeColWidth = window.localStorage.getItem(`sd_code_offset`)
  if (baseCodeColWidth !== null) codeOffset = parseFloat(baseCodeColWidth)

  const baseContentColWidth = window.localStorage.getItem(`sd_content_offset`)
  if (baseContentColWidth !== null)
    contentOffset = parseFloat(baseContentColWidth)
}

export const contentX = motionValue(contentOffset)
export const codeX = motionValue(codeOffset)

document.documentElement.style.setProperty(
  "--code-column-offset",
  -codeOffset + "px"
)

document.documentElement.style.setProperty(
  "--content-column-offset",
  contentOffset + "px"
)

codeX.onChange((offset: number) => {
  if (window.localStorage !== undefined) {
    window.localStorage.setItem(`sd_code_offset`, offset.toString())
  }

  document.documentElement.style.setProperty(
    "--code-column-offset",
    -offset + "px"
  )
})

contentX.onChange((offset: number) => {
  if (window.localStorage !== undefined) {
    window.localStorage.setItem(`sd_content_offset`, offset.toString())
  }

  document.documentElement.style.setProperty(
    "--content-column-offset",
    offset + "px"
  )
})

const Layout: React.FC = ({ children }) => {
  const [isDragging, setIsDragging] = React.useState(false)

  return (
    <Grid
      sx={{
        position: "absolute",
        border: "outline",
        borderColor: "border",
        background: "background",
        gridTemplateColumns: [
          "1fr 1fr 1fr",
          `calc(${BASE_CONTENT_COL_WIDTH}px + var(--content-column-offset)) 
           1fr
           calc(${BASE_CODE_COL_WIDTH}px + var(--code-column-offset))`,
        ],
        gridTemplateRows: ["40px min-content 1fr", `40px 40px 1fr 44px`],
        gridAutoColumns: "auto",
        gridTemplateAreas: [
          `
          "menu    title   controls"
          "content main    tabs"
          "content main    code"
					"content main  		code"
					"content main  		code"
          `,
        ],
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        p: 0,
        gap: 0,
        color: "text",
        bg: "background",
        margin: [0, 0, "0 auto"],
        overscrollBehavior: "none",
        "& *[data-hidey-draggy]": {
          visibility: isDragging ? "visible" : "hidden",
        },
      }}
    >
      {children}
      <DragHandleHorizontal
        align="left"
        initial={BASE_CONTENT_COL_WIDTH}
        min={96}
        max={220}
        gridArea="content"
        motionValue={contentX}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      />
      <DragHandleHorizontal
        align="right"
        initial={BASE_CODE_COL_WIDTH}
        min={80}
        max={900}
        gridArea="code"
        motionValue={codeX}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      />
    </Grid>
  )
}

export default Layout
