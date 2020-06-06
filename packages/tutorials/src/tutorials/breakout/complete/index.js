import React from "react"
import { useStateDesigner } from "@state-designer/react"
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
  const state = useStateDesigner({
    data: {
      bricks: range2d(brickColumnCount, brickRowCount).map((row, y) =>
        row.map((x) => ({
          id: y * brickColumnCount + x,
          x: x * (brickWidth + brickPadding) + brickOffsetLeft,
          y: y * (brickHeight + brickPadding) + brickOffsetTop,
          status: 1,
        }))
      ),
      ball: {
        x: motionValue((w - ballDiameter) / 2),
        y: motionValue(h - paddleHeight - ballDiameter),
        dx: 2,
        dy: -2,
      },
      paddle: {
        x: motionValue((w - paddleWidth) / 2),
        y: h - paddleHeight,
      },
      score: 0,
      lives: 3,
    },
    initial: "start",
    states: {
      start: {
        on: { STARTED: { to: "playing" } },
      },
      playing: {
        on: { STARTED: { to: "paused" } },
        repeat: {
          onRepeat: [
            {
              unless: "hasLivesRemaining",
              to: "gameover",
            },
            {
              if: "allBricksAreDestroyed",
              to: "gameover",
            },
            {
              get: "nextBallBounds",
              if: "ballIsTouchingPaddle",
              secretlyDo: ["moveBallToPaddleTop", "bounceBallY"],
            },
            {
              if: "ballIsTouchingLeftOrRightEdge",
              secretlyDo: "bounceBallX",
            },
            {
              if: "ballIsTouchingTopEdge",
              secretlyDo: "bounceBallY",
            },
            {
              if: "ballIsTouchingBottomEdge",
              do: ["loseOneLife", "resetBall"],
              to: "paused",
            },
            {
              get: "touchingBrick",
              if: "hasTouchingBrick",
              do: ["destroyBrick", "increaseScore", "bounceBallY"],
            },
            { secretlyDo: "moveBall" },
          ],
        },
        initial: "idle",
        states: {
          idle: {
            on: {
              STARTED_MOVING_LEFT: { secretlyTo: "movingLeft" },
              STARTED_MOVING_RIGHT: { secretlyTo: "movingRight" },
            },
          },
          movingLeft: {
            on: {
              STOPPED_MOVING: { secretlyTo: "idle" },
            },
            repeat: {
              onRepeat: {
                if: "paddleCanMoveLeft",
                secretlyDo: "movePaddleLeft",
              },
            },
          },
          movingRight: {
            on: {
              STOPPED_MOVING: { secretlyTo: "idle" },
            },
            repeat: {
              onRepeat: {
                if: "paddleCanMoveRight",
                secretlyDo: "movePaddleRight",
              },
            },
          },
        },
      },
      paused: {
        on: { STARTED: { to: "playing" } },
      },
      gameover: {
        on: { STARTED: { do: "reset", to: "playing" } },
      },
    },
    results: {
      nextBallBounds(data) {
        const bl = data.ball.x.get() + data.ball.dx,
          bt = data.ball.y.get() + data.ball.dy,
          br = bl + ballDiameter,
          bb = bt + ballDiameter

        return { left: bl, top: bt, right: br, bottom: bb }
      },
      touchingBrick(data, payload, result) {
        const { left, right, top, bottom } = result

        for (let y = 0; y < brickColumnCount; y++) {
          for (let x = 0; x < brickRowCount; x++) {
            const brick = data.bricks[y][x]
            if (brick.status === 1) {
              if (
                !(
                  right < brick.x ||
                  left > brick.x + brickWidth ||
                  bottom < brick.y ||
                  top > brick.y + brickHeight
                )
              ) {
                return brick
              }
            }
          }
        }
      },
    },
    conditions: {
      hasTouchingBrick(data, payload, brick) {
        return brick !== undefined
      },
      ballIsTouchingPaddle(data, payload, result) {
        const { left, right, top, bottom } = result

        return !(
          right < data.paddle.x.get() ||
          left > data.paddle.x.get() + paddleWidth ||
          bottom < data.paddle.y ||
          top > data.paddle.y + paddleHeight
        )
      },
      ballIsTouchingLeftOrRightEdge(data, payload, result) {
        const { left, right } = result
        return right > w || left < 0
      },
      ballIsTouchingTopEdge(data, payload, result) {
        const { top } = result
        return top < 0
      },
      ballIsTouchingBottomEdge(data, payload, result) {
        const { bottom } = result
        return bottom > h
      },
      hasLivesRemaining(data) {
        return data.lives >= 0
      },
      paddleCanMoveLeft(data) {
        return data.paddle.x.get() > 0
      },
      paddleCanMoveRight(data) {
        return data.paddle.x.get() < w - paddleWidth
      },
      allBricksAreDestroyed(data) {
        return data.score === brickColumnCount * brickRowCount
      },
    },
    actions: {
      resetBall(data) {
        data.ball.x.set((w - ballDiameter) / 2)
        data.ball.y.set(h - paddleHeight - ballDiameter)
        data.ball.dx = 2
        data.ball.dy = -2
        data.paddle.x.set((w - paddleWidth) / 2)
      },
      reset(data) {
        data.ball.x.set((w - ballDiameter) / 2)
        data.ball.y.set(h - paddleHeight - ballDiameter)
        data.ball.dx = 2
        data.ball.dy = -2
        data.paddle.x.set((w - paddleWidth) / 2)

        Object.assign(data, {
          bricks: range2d(brickColumnCount, brickRowCount).map((row, y) =>
            row.map((x) => ({
              x: x * (brickWidth + brickPadding) + brickOffsetLeft,
              y: y * (brickHeight + brickPadding) + brickOffsetTop,
              status: 1,
            }))
          ),
          score: 0,
          lives: 3,
        })
      },
      destroyBrick(data, payload, brick) {
        brick.status = 0
      },
      loseOneLife(data) {
        data.lives--
      },
      moveBall(data) {
        data.ball.x.set(data.ball.x.get() + data.ball.dx)
        data.ball.y.set(data.ball.y.get() + data.ball.dy)
      },
      movePaddleLeft(data) {
        const x = clamp(data.paddle.x.get() - 7, 0, w - paddleWidth)
        data.paddle.x.set(x)
      },
      movePaddleRight(data) {
        const x = clamp(data.paddle.x.get() + 7, 0, w - paddleWidth)
        data.paddle.x.set(x)
      },
      bounceBallX(data) {
        data.ball.dx *= -1
      },
      bounceBallY(data) {
        data.ball.dy *= -1
      },
      moveBallToPaddleTop(data) {
        data.ball.y.set(data.paddle.y - ballDiameter)
      },
      increaseScore(data) {
        data.score++
      },
    },
    values: {
      bricks(data) {
        let bricks = []

        for (let row of data.bricks) {
          for (let col of row) {
            if (col.status === 1) {
              bricks.push(col)
            }
          }
        }
        return bricks
      },
    },
  })

  useKeyboardInputs({
    onKeyDown: {
      " ": () => state.send("STARTED"),
      ArrowLeft: () => state.send("STARTED_MOVING_LEFT"),
      ArrowRight: () => state.send("STARTED_MOVING_RIGHT"),
    },
    onKeyUp: {
      ArrowLeft: () => state.send("STOPPED_MOVING"),
      ArrowRight: () => state.send("STOPPED_MOVING"),
    },
  })

  return (
    <B.Layout>
      <B.PlayField>
        {state.values.bricks.map((brick) => (
          <B.Brick
            key={brick.id}
            style={{
              x: brick.x,
              y: brick.y,
              width: brickWidth,
              height: brickHeight,
            }}
          />
        ))}
        <B.Ball
          style={{
            x: state.data.ball.x,
            y: state.data.ball.y,
            width: ballDiameter,
            height: ballDiameter,
          }}
        />
        <B.Paddle
          style={{
            x: state.data.paddle.x,
            y: state.data.paddle.y,
            width: paddleWidth,
            height: paddleHeight,
          }}
        />
      </B.PlayField>
      <B.Button
        highlight={!state.isIn("playing")}
        onClick={() => state.send("STARTED")}
      >
        {state.whenIn({
          start: "Start",
          playing: "Pause",
          paused: "Resume",
          gameover: "Play Again",
        })}
      </B.Button>
      <B.Stats>
        <B.Label>Score</B.Label>
        {state.data.score}
        <B.Label>Lives</B.Label>
        {state.data.lives}
      </B.Stats>
    </B.Layout>
  )
}
