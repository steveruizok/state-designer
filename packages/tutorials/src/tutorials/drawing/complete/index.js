import React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Drawing as D, theme } from "components"

const w = 320,
  h = 400,
  sizes = [1, 3, 6, 12, 24, 48],
  colors = ["green", "blue", "purple", "red", "orange", "yellow", "gray"]

export default function () {
  const rCanvasFrame = React.useRef()
  const rMarksCanvas = React.useRef()
  const rCurrentCanvas = React.useRef()

  const state = useStateDesigner({
    data: {
      color: "red",
      size: 6,
      marks: [],
      currentMark: undefined,
      redos: [],
    },
    initial: "notDrawing",
    states: {
      notDrawing: {
        on: {
          STARTED_DRAWING: {
            to: "drawing",
            do: ["clearRedos", "beginMark"],
          },
        },
      },
      drawing: {
        on: {
          STOPPED_DRAWING: {
            to: "notDrawing",
            do: "completeMark",
          },
          MOVED_CURSOR: {
            secretlyDo: "addPointToMark",
          },
        },
      },
    },
    on: {
      SELECTED_COLOR: "setColor",
      SELECTED_SIZE: "setSize",
      UNDO: { if: "hasMarks", do: "undoMark" },
      REDO: { if: "hasRedos", do: "redoMark" },
    },
    results: {
      canvas() {
        return rCurrentCanvas.current
      },
      context(data, payload, result) {
        return result.getContext("2d")
      },
    },
    conditions: {
      hasMarks(data) {
        return data.marks.length > 0
      },
      hasRedos(data) {
        return data.redos.length > 0
      },
    },
    actions: {
      setColor(data, payload) {
        data.color = payload
      },
      setSize(data, payload) {
        data.size = payload
      },
      beginMark(data, payload) {
        const { x, y } = payload
        data.currentMark = {
          size: data.size,
          color: data.color,
          points: [
            { x, y },
            { x, y },
          ],
        }
      },
      completeMark(data) {
        data.marks.push(data.currentMark)
        data.currentMark = undefined
      },
      addPointToMark(data, payload) {
        const { x, y } = payload
        data.currentMark.points.push({ x, y })
      },
      undoMark(data) {
        data.redos.push(data.marks.pop())
      },
      redoMark(data) {
        data.marks.push(data.redos.pop())
      },
      clearRedos(data) {
        data.redos = []
      },
    },
  })

  // Draw a mark onto the given canvas
  function drawMark(ctx, mark) {
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()
    ctx.lineWidth = mark.size
    ctx.strokeStyle = theme.colors[mark.color]["500"]

    const [first, ...rest] = mark.points

    ctx.moveTo(first.x, first.y)

    for (let point of rest) {
      ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()
  }

  // Draw marks onto the bottom canvas only when marks array changes
  React.useEffect(() => {
    const cvs = rMarksCanvas.current
    const ctx = cvs.getContext("2d")

    if (ctx) {
      ctx.clearRect(0, 0, w, h)

      for (let mark of state.data.marks) {
        drawMark(ctx, mark)
      }
    }
  }, [state.data.marks])

  // Draw the current mark onto the top canvas on each frame
  React.useEffect(() => {
    let frame = 0

    function loop() {
      const cvs = rCurrentCanvas.current
      const ctx = cvs.getContext("2d")

      if (ctx) {
        ctx.clearRect(0, 0, w, h)

        // Draw current mark
        if (state.data.currentMark !== undefined) {
          drawMark(ctx, state.data.currentMark)
        }

        frame = requestAnimationFrame(loop)
      }
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Get relative x and y from mouse event
  function getPoint(e) {
    const { offsetLeft, offsetTop } = rCanvasFrame.current
    return { x: e.pageX - offsetLeft, y: e.pageY - offsetTop }
  }

  const { data } = state

  return (
    <D.Layout w="fit-content">
      <D.CanvasFrame
        ref={rCanvasFrame}
        onMouseDown={(e) => state.send("STARTED_DRAWING", getPoint(e))}
        onMouseUp={(e) => state.send("STOPPED_DRAWING", getPoint(e))}
        onMouseMove={(e) => state.send("MOVED_CURSOR", getPoint(e))}
      >
        <canvas ref={rMarksCanvas} width={w} height={h} />
        <canvas ref={rCurrentCanvas} width={w} height={h} />
      </D.CanvasFrame>
      <D.Buttons>
        {colors.map((color, i) => (
          <D.ColorButton
            key={i}
            color={color}
            highlight={data.color === color}
            onClick={() => state.send("SELECTED_COLOR", color)}
          />
        ))}
      </D.Buttons>
      <D.Buttons>
        {sizes.map((size, i) => (
          <D.SizeButton
            key={i}
            highlight={data.size === size}
            onClick={() => state.send("SELECTED_SIZE", size)}
          >
            {size}
          </D.SizeButton>
        ))}
      </D.Buttons>
      <D.Buttons>
        <D.Button
          disabled={data.marks.length === 0}
          onClick={() => state.send("UNDO")}
        >
          Undo
        </D.Button>
        <D.Button
          disabled={data.redos.length === 0}
          onClick={() => state.send("REDO")}
        >
          Redo
        </D.Button>
      </D.Buttons>
    </D.Layout>
  )
}
