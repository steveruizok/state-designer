import React from "react"
import { Breakout as B } from "components"
import { motionValue } from "framer-motion"
import { useKeyboardInputs, range2d, clamp } from "utils"

var ballRadius = 10,
  ballDiameter = ballRadius * 2,
  w = 400,
  h = 240,
  paddleHeight = 10,
  paddleWidth = 75,
  brickRowCount = 4,
  brickColumnCount = 3,
  brickWidth = 75,
  brickHeight = 20,
  brickPadding = 10,
  brickOffsetTop = 30,
  brickOffsetLeft = 30

export default function () {
  return (
    <B.Layout>
      <B.PlayField>
        <B.Brick
          style={{
            x: brickOffsetLeft,
            y: brickOffsetTop,
            width: brickWidth,
            height: brickHeight,
          }}
        />
        <B.Brick
          style={{
            x: brickWidth + brickPadding + brickOffsetLeft,
            y: brickHeight + brickPadding + brickOffsetTop,
            width: brickWidth,
            height: brickHeight,
          }}
        />
        <B.Ball
          style={{
            x: (w - ballDiameter) / 2,
            y: h - paddleHeight - ballDiameter,
            width: ballDiameter,
            height: ballDiameter,
          }}
        />
        <B.Paddle
          style={{
            x: (w - paddleWidth) / 2,
            y: h - paddleHeight,
            width: paddleWidth,
            height: paddleHeight,
          }}
        />
      </B.PlayField>
      <B.Button highlight={true}>Play</B.Button>
      <B.Stats>
        <B.Label>Score</B.Label>0<B.Label>Lives</B.Label>0
      </B.Stats>
    </B.Layout>
  )
}
