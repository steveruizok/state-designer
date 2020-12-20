import * as React from "react"
import { styled, IconButton } from "components/theme"
import { motion, useMotionValue, animate } from "framer-motion"
import { panelOffsets, setupOffsets, setPanelOffset } from "lib/local-data"
import { Home, Sun, Copy, Plus, Minus } from "react-feather"
import { LayoutOffset } from "types"

import Content from "./content"
import Code from "./code"
import Console, { CONSOLE_HEIGHT } from "./console"
import Details from "./details"

const CONTENT_COL_WIDTH = 200
const CODE_COL_WIDTH = 320
const DETAILS_ROW_HEIGHT = 320

export default function ProjectView() {
  const rMainContainer = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    setupOffsets()
  }, [])

  return (
    <Layout>
      <MenuContainer>
        <IconButton>
          <Home />
        </IconButton>
      </MenuContainer>
      <TitleContainer>Title</TitleContainer>
      <ControlsContainer>
        <IconButton>
          <Minus />
        </IconButton>
        <IconButton>
          <Plus />
        </IconButton>
        <IconButton>
          <Copy />
        </IconButton>
        <IconButton>
          <Sun />
        </IconButton>
      </ControlsContainer>
      <Content>
        <DragHandleHorizontal
          align="left"
          width={CONTENT_COL_WIDTH}
          left={60}
          right={100}
          offset="content"
        />
      </Content>
      <MainContainer>
        <MainDragArea ref={rMainContainer} />
        <ChartContainer>Chart</ChartContainer>
        <ViewContainer>
          View
          <Console>
            <DragHandleVertical
              height={CONSOLE_HEIGHT}
              top={580}
              bottom={CONSOLE_HEIGHT - 40}
              offset="console"
              align="bottom"
            />
          </Console>
        </ViewContainer>
        <Details>
          <DragHandleVertical
            height={DETAILS_ROW_HEIGHT}
            top={300}
            bottom={DETAILS_ROW_HEIGHT - 40}
            offset="detail"
            align="bottom"
          />
        </Details>
        <DragHandleHorizontalRelative
          containerRef={rMainContainer}
          offset="main"
        />
      </MainContainer>
      <Code>
        <DragHandleHorizontal
          align="right"
          width={CODE_COL_WIDTH}
          left={300}
          right={280}
          offset="code"
        />
      </Code>
    </Layout>
  )
}

/* ---------------------- Code ---------------------- */

const TabButton = styled.button({
  fontWeight: 500,
})

/* --------------------- LAYOUT --------------------- */

const Layout = styled.div({
  display: "grid",
  position: "absolute",
  bg: "$background",
  top: 0,
  left: 0,
  height: "100vh",
  width: "100vw",
  minHeight: "auto",
  minWidth: "auto",
  overflow: "hidden",
  gridTemplateColumns: `calc(${CONTENT_COL_WIDTH}px + var(--content-offset)) minmax(10%, 1fr) calc(${CODE_COL_WIDTH}px - var(--code-offset))`,
  gridTemplateRows: "40px minmax(0, 1fr)",
  gridTemplateAreas: `
	"menu    title controls"
	"content main  code"`,
})

const MenuContainer = styled.div({
  gridArea: "menu",
  display: "flex",
  alignItems: "center",
  borderBottom: "2px solid $border",
})

const TitleContainer = styled.div({
  gridArea: "title",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  borderBottom: "2px solid $border",
})

const ControlsContainer = styled.div({
  gridArea: "controls",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  borderBottom: "2px solid $border",
})

const MainContainer = styled.div({
  position: "relative",
  gridArea: "main",
  display: "grid",
  minHeight: "auto",
  minWidth: "auto",
  maxWidth: "100%",
  maxHeight: "100%",
  overflow: "hidden",
  gridTemplateAreas: `"chart view" "details view"`,
  gridTemplateColumns: `calc(50% + var(--main-offset)) minmax(15%, 1fr)`,
  gridTemplateRows: `minmax(0, 1fr) min(100%, calc(${DETAILS_ROW_HEIGHT}px - var(--detail-offset)))`,
})

const MainDragArea = styled.div({
  position: "absolute",
  top: 0,
  left: "10%",
  width: "80%",
  height: "100%",
})

const ChartContainer = styled.div({
  position: "relative",
  gridArea: "chart",
  display: "grid",
  borderRight: "2px solid $border",
})

const ViewContainer = styled.div({
  gridArea: "view",
  position: "relative",
})

interface DragHandleProps {
  offset: LayoutOffset
}

interface DragHandleHorizontalProps extends DragHandleProps {
  width: number
  left: number
  right: number
  align: "left" | "right"
}

const DragHandle = styled(motion.div, {
  position: "absolute",
  backgroundColor: "transparent",
  zIndex: 999,
  "&:hover": {
    bg: "$hover",
  },
  variants: {
    direction: {
      horizontal: {
        width: "100%",
        height: 4,
        cursor: "ns-resize",
      },
      vertical: {
        width: 4,
        height: "100%",
        cursor: "ew-resize",
      },
    },
  },
})

export function DragHandleHorizontal({
  width,
  left,
  right,
  align,
  offset,
}: DragHandleHorizontalProps) {
  const rMotionX = useMotionValue(0)
  const [distance, setDistance] = React.useState(panelOffsets[offset])

  React.useEffect(() => {
    setDistance(panelOffsets[offset])
  }, [offset])

  React.useEffect(() => {
    return rMotionX.onChange((v) => setPanelOffset(offset, distance + v))
  }, [distance, offset, rMotionX])

  // When at full width, double tap to return to normal
  // When at normal width, double tap to reach max
  function togglePosition() {
    const y = rMotionX.get()

    if (align === "left" && y + distance === 0) {
      animate(rMotionX, right + -distance, {
        type: "spring",
        stiffness: 200,
        damping: 20,
      })
    } else if (align === "right" && y + distance === 0) {
      animate(rMotionX, -(left + distance), {
        type: "spring",
        stiffness: 200,
        damping: 20,
      })
    } else {
      animate(rMotionX, -distance, {
        type: "spring",
        stiffness: 200,
        damping: 20,
      })
    }
  }

  return (
    <DragHandle
      direction="vertical"
      style={{
        x: rMotionX,
        [align]: align === "left" ? width + distance - 3 : width - distance - 3,
      }}
      drag="x"
      dragConstraints={{
        left: -left - distance,
        right: right - distance,
      }}
      dragElastic={0.1}
      onDoubleClick={togglePosition}
    />
  )
}

interface DragHandleVerticalProps extends DragHandleProps {
  height: number
  top: number
  bottom: number
  align: "top" | "bottom"
}

export function DragHandleVertical({
  height,
  top,
  bottom,
  align,
  offset,
}: DragHandleVerticalProps) {
  const [distance, setDistance] = React.useState(panelOffsets[offset])

  React.useEffect(() => {
    setDistance(panelOffsets[offset])
  }, [offset])

  const rMotionY = useMotionValue(0)

  React.useEffect(() => {
    return rMotionY.onChange((v) => setPanelOffset(offset, distance + v))
  }, [distance, offset, rMotionY])

  // When at full height, double tap to return to normal
  // When at normal height, double tap to reach max
  function togglePosition() {
    const y = rMotionY.get()

    if (align === "top" && y + distance === 0) {
      animate(rMotionY, bottom - distance, {
        type: "spring",
        stiffness: 200,
        damping: 20,
      })
    } else if (align === "bottom" && y + distance === 0) {
      animate(rMotionY, -(top + distance), {
        type: "spring",
        stiffness: 200,
        damping: 20,
      })
    } else {
      animate(rMotionY, -distance, {
        type: "spring",
        stiffness: 200,
        damping: 20,
      })
    }
  }

  return (
    <DragHandle
      direction="horizontal"
      style={{
        [align]:
          align === "top" ? height + distance - 3 : height - distance - 3,
        y: rMotionY,
      }}
      drag="y"
      dragConstraints={{
        top: -top - distance,
        bottom: bottom - distance,
      }}
      dragElastic={0.1}
      onDoubleClick={togglePosition}
    />
  )
}

interface DragHandleHorizontalRelativeProps extends DragHandleProps {
  containerRef: React.RefObject<HTMLDivElement>
}

export function DragHandleHorizontalRelative({
  containerRef,
  offset,
}: DragHandleHorizontalRelativeProps) {
  const rMotionX = useMotionValue(0)
  const [distance, setDistance] = React.useState(panelOffsets[offset])

  React.useEffect(() => {
    setDistance(panelOffsets[offset])
  }, [offset])

  React.useEffect(() => {
    return rMotionX.onChange((v) => setPanelOffset(offset, distance + v))
  }, [distance, offset, rMotionX])

  // When at full width, double tap to return to normal
  // When at normal width, double tap to reach max
  function togglePosition() {
    animate(rMotionX, -distance, {
      type: "spring",
      stiffness: 200,
      damping: 20,
    })
  }

  return (
    <DragHandle
      direction="horizontal"
      style={{
        x: rMotionX,
        left: `calc(50% + ${distance - 2}px)`,
        position: "absolute",
        backgroundColor: "transparent",
        height: "100%",
        width: 4,
        cursor: "ew-resize",
      }}
      drag="x"
      dragConstraints={containerRef}
      dragElastic={0.1}
      onDoubleClick={togglePosition}
    />
  )
}
