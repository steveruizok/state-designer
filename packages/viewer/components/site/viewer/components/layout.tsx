import * as React from "react"
import { Grid } from "theme-ui"
import DragHandleVertical from "./drag-handle-vertical"
import DragHandleHorizontal from "./drag-handle-horizontal"
import { motionValue } from "framer-motion"

const BASE_CONTENT_COL_WIDTH = 260
const BASE_CODE_COL_WIDTH = 420
const BASE_DETAIL_ROW_HEIGHT = 200
const BASE_SAVE_ROW_HEIGHT = 44

export const contentX = motionValue(0)
export const codeX = motionValue(0)
export const detailY = motionValue(0)

function setDetailRowCSS(offset: number) {
  document.documentElement.style.setProperty(
    "--detail-row-offset",
    -offset + "px"
  )
}

contentX.onChange((offset: number) => {
  document.documentElement.style.setProperty(
    "--content-column-offset",
    offset + "px"
  )
})

codeX.onChange((offset: number) => {
  document.documentElement.style.setProperty(
    "--code-column-offset",
    -offset + "px"
  )
})

detailY.onChange((offset: number) => {
  document.documentElement.style.setProperty(
    "--detail-row-offset",
    -offset + "px"
  )
})

const Layout: React.FC = ({ children }) => {
  return (
    <Grid
      sx={{
        position: "absolute",
        border: "outline",
        borderColor: "border",
        gridTemplateColumns: [
          "1fr 1fr 1fr",
          `calc(${BASE_CONTENT_COL_WIDTH}px + var(--content-column-offset)) 
           1fr
           calc(${BASE_CODE_COL_WIDTH}px + var(--code-column-offset))`,
        ],
        gridTemplateRows: [
          "40px min-content 1fr",
          `40px 1fr calc(${
            BASE_DETAIL_ROW_HEIGHT - BASE_SAVE_ROW_HEIGHT
          }px + var(--detail-row-offset)) ${BASE_SAVE_ROW_HEIGHT}px`,
        ],
        gridAutoColumns: "auto",
        gridTemplateAreas: [
          `
          "menu head controls"
          "title title title"
          "main main main"
          "data values send"
          "code code code"
          "save save save"
          "content content content"
          `,
          `
          "menu    title   controls"
          "content main    code"
          "content detail  code"
          "content detail  save"
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
      }}
    >
      {children}

      <DragHandleHorizontal
        align="right"
        initial={BASE_CODE_COL_WIDTH}
        min={80}
        max={400}
        gridArea="code"
        motionValue={codeX}
      />
      <DragHandleHorizontal
        align="left"
        initial={BASE_CONTENT_COL_WIDTH}
        min={96}
        max={220}
        gridArea="content"
        motionValue={contentX}
      />
      <DragHandleVertical
        align="bottom"
        initial={BASE_DETAIL_ROW_HEIGHT}
        min={BASE_SAVE_ROW_HEIGHT}
        max={320}
        gridArea="detail"
        onChange={setDetailRowCSS}
      />
    </Grid>
  )
}

export default Layout
