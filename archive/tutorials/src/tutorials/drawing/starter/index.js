import React from "react"
import { Drawing as D, theme } from "components"

const w = 320,
  h = 400,
  sizes = [1, 3, 6, 12, 24, 48],
  colors = ["green", "blue", "purple", "red", "orange", "yellow", "gray"]

export default function () {
  return (
    <D.Layout w="fit-content">
      <D.CanvasFrame>
        <canvas width={w} height={h} />
        <canvas width={w} height={h} />
      </D.CanvasFrame>
      <D.Buttons>
        {colors.map((color, i) => (
          <D.ColorButton key={i} color={color} />
        ))}
      </D.Buttons>
      <D.Buttons>
        {sizes.map((size, i) => (
          <D.SizeButton key={i}>{size}</D.SizeButton>
        ))}
      </D.Buttons>
      <D.Buttons>
        <D.Button>Undo</D.Button>
        <D.Button>Redo</D.Button>
      </D.Buttons>
    </D.Layout>
  )
}
