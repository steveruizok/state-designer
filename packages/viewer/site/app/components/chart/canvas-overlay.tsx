// @jsx jsx
import * as React from "react"
import { jsx, Box } from "theme-ui"
import { MotionValue, motion } from "framer-motion"
import { S, useStateDesigner } from "@state-designer/react"
import { Highlights } from "../../states/highlights"
import { quadrant, theta, normal, gradient } from "./helpers"

const CanvasOverlay: React.FC<{
  scale: MotionValue<number>
  offsetX: MotionValue<number>
  offsetY: MotionValue<number>
  width: MotionValue<number>
  height: MotionValue<number>
}> = ({ scale, offsetX, offsetY, width, height }) => {
  const local = useStateDesigner(Highlights)

  const rCanvas = React.useRef<HTMLCanvasElement>()

  React.useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = rCanvas.current
      if (!canvas) return

      const w = width.get()
      const h = height.get()

      canvas.width = w
      canvas.height = h
    }

    updateCanvasSize()

    const unsubs = [
      width.onChange(updateCanvasSize),
      height.onChange(updateCanvasSize),
    ]

    return () => unsubs.forEach((fn) => fn())
  }, [])

  React.useEffect(() => {
    const cvs = rCanvas.current
    const ctx = cvs?.getContext("2d")
    if (!ctx) return

    const sc = scale.get()

    ctx.clearRect(0, 0, cvs.width, cvs.height)

    const { highlitStateRef: hl, targets } = local.values

    if (hl) {
      const cFrame = getFrame(cvs, sc, 0, 0)

      const hFrame = getFrame(hl, sc, cFrame.x, cFrame.y)

      ctx.fillStyle = "rgba(255, 0, 0, .15)"

      fillRectWithScale(ctx, hFrame, sc)

      if (local.data.event) {
        const eventButtons = local.data.eventButtonRefs
        if (!eventButtons) {
          return
        }
        const pathEvents = eventButtons.get(local.data.path)
        if (!pathEvents) {
          console.log("No events found for that state", local.data.path)
          return
        }
        const buttonRef = pathEvents.get(local.data.event)

        if (!buttonRef) return

        const button = buttonRef.current

        if (!button) return

        const bFrame = getFrame(button, sc, cFrame.x, cFrame.y)

        fillRectWithScale(ctx, bFrame, sc)

        if (targets) {
          for (let target of targets) {
            const targ = target.ref.current
            if (!targ) continue

            const tFrame = getFrame(targ, sc, cFrame.x, cFrame.y)

            drawLineFromEventButtonToStateNode(ctx, bFrame, tFrame)

            fillRectWithScale(ctx, tFrame, sc)
          }
        }
      }
    }
  }, [local.values.highlitStateRef, local.values.targets])

  // React.useEffect(() => {
  //   console.log("Targets", local.values.targets)
  // }, [local.values.targets])

  return (
    <motion.canvas
      ref={rCanvas}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: "none",
      }}
    />
  )
}

export default CanvasOverlay

// Helpers

interface Point {
  x: number
  y: number
}

interface Rect extends Point {
  width: number
  height: number
}

interface Frame extends Rect {
  midX: number
  midY: number
  maxX: number
  maxY: number
  center: Point
}

function getFrame(
  el: HTMLElement,
  scale: number,
  offsetX: number,
  offsetY: number
): Frame {
  const rect = el.getBoundingClientRect()
  let x = rect.left
  let y = rect.top
  let w = rect.right - rect.left
  let h = rect.bottom - rect.top

  x /= scale
  y /= scale
  w /= scale
  h /= scale

  x -= offsetX
  y -= offsetY

  return {
    x: x,
    y: y,
    width: w,
    height: h,
    midX: x + w / 2,
    midY: y + h / 2,
    maxX: x + w,
    maxY: y + h,
    center: {
      x: x + w / 2,
      y: y + h / 2,
    },
  }
}

function fillRectWithScale(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  scale: number
) {
  ctx.fillRect(frame.x, frame.y, frame.width, frame.height)
}

function drawLineFromEventButtonToStateNode(
  ctx: CanvasRenderingContext2D,
  a: Frame,
  b: Frame
) {
  const n = normal(a.center, b.center)
  const g = gradient(a.center, b.center)
  const q = quadrant(a.center, b.center)
  const t = theta(a.center, b.center)
  const d = Math.floor((t * (180 / Math.PI)) / 45)
  let start: Point, end: Point, mid: Point
  console.log(q, g, n, t, d)

  //  4 | 1
  // -------
  // 3 | 2

  ctx.save()
  ctx.beginPath()

  switch (q) {
    case 1: {
      if (a.maxY <= b.maxY) {
        start = { x: a.midX, y: a.y } // top
        end = { x: b.x, y: b.midY } // left
        mid = {
          x: end.x + (start.x - end.x) / 2,
          y: end.y + (start.y - end.y) / 2,
        }
        ctx.moveTo(start.x, start.y)
        ctx.quadraticCurveTo(start.x, mid.y, mid.x, mid.y)
        ctx.quadraticCurveTo(end.x, mid.y, end.x, end.y)
      } else {
        start = { x: a.midX, y: a.y } // top
        end = { x: b.midX, y: b.maxY } // bottom
        mid = {
          x: end.x + (start.x - end.x) / 2,
          y: end.y + (start.y - end.y) / 2,
        }
        ctx.moveTo(start.x, start.y)
        ctx.quadraticCurveTo(start.x, mid.y * 1.05, mid.x, mid.y)
        ctx.quadraticCurveTo(end.x, mid.y * 0.95, end.x, end.y)
      }
      break
    }
    case 2: {
      start = { x: a.midX, y: a.maxY } // bottom
      end = { x: b.midX, y: b.y } // top
      mid = {
        x: end.x + (start.x - end.x) / 2,
        y: end.y + (start.y - end.y) / 2,
      }
      ctx.moveTo(start.x, start.y)
      ctx.quadraticCurveTo(start.x, mid.y * 0.95, mid.x, mid.y)
      ctx.quadraticCurveTo(end.x, mid.y * 1.05, end.x, end.y)
      break
    }
    case 3: {
      start = { x: a.midX, y: a.maxY } // bottom
      end = { x: b.midX, y: b.y } // top
      mid = {
        x: end.x + (start.x - end.x) / 2,
        y: end.y + (start.y - end.y) / 2,
      }
      ctx.moveTo(start.x, start.y)
      ctx.quadraticCurveTo(start.x, mid.y * 0.95, mid.x, mid.y)
      ctx.quadraticCurveTo(end.x, mid.y * 1.05, end.x, end.y)
      break
    }
    case 4: {
      if (a.maxY <= b.maxY) {
        start = { x: a.midX, y: a.y } // top
        end = { x: b.maxX, y: b.midY } // left
        mid = {
          x: end.x + (start.x - end.x) / 2,
          y: end.y + (start.y - end.y) / 2,
        }
        ctx.moveTo(start.x, start.y)
        ctx.quadraticCurveTo(start.x, mid.y, mid.x, mid.y)
        ctx.quadraticCurveTo(end.x, mid.y, end.x, end.y)
      } else {
        start = { x: a.midX, y: a.y } // top
        end = { x: b.midX, y: b.maxY } // bottom
        mid = {
          x: end.x + (start.x - end.x) / 2,
          y: end.y + (start.y - end.y) / 2,
        }
        ctx.moveTo(start.x, start.y)
        ctx.quadraticCurveTo(start.x, mid.y * 1.05, mid.x, mid.y)
        ctx.quadraticCurveTo(end.x, mid.y * 0.95, end.x, end.y)
      }

      break
    }
    default: {
      throw Error("Something's wrong")
    }
  }

  ctx.strokeStyle = "red"
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}
