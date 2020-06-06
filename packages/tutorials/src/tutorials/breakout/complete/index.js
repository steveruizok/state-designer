import React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Snake as S } from "components"
import { useKeyboardInputs, range2d } from "utils"

var ballRadius = 10,
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
          x: x * (brickWidth + brickPadding) + brickOffsetLeft,
          y: y * (brickHeight + brickPadding) + brickOffsetTop,
          status: 1,
        }))
      ),
      ball: { x: w / 2, y: h - 30, dx: 2, dy: -2 },
      paddleX: (w - paddleWidth) / 2,
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
              if: "ballIsTouchingLeftOrRightEdge",
              secretlyDo: "bounceBallX",
            },
            {
              ifAny: ["ballIsTouchingTopEdge", "ballIsTouchingPaddle"],
              secretlyDo: "bounceBallY",
            },
            {
              get: "touchingBrick",
              if: "hasTouchingBrick",
              secretlyDo: ["destroyBrick", "increaseScore", "bounceBallY"],
            },
            {
              if: "allBricksAreDestroyed",
              to: "gameover",
            },
            {
              if: "ballIsTouchingBottomEdge",
              secretlyDo: ["loseOneLife", "resetBall"],
            },
            {
              unless: "hasLivesRemaining",
              to: "gameover",
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
      touchingBrick(data) {
        const nx = data.ball.x + data.ball.dx
        const ny = data.ball.y + data.ball.dy

        for (let y = 0; y < brickColumnCount; y++) {
          for (let x = 0; x < brickRowCount; x++) {
            const brick = data.bricks[y][x]
            if (brick.status === 1) {
              if (
                nx > brick.x &&
                nx < brick.x + brickWidth &&
                ny > brick.y &&
                ny < brick.y + brickHeight
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
      ballIsTouchingPaddle(data) {
        const nx = data.ball.x + data.ball.dx
        const ny = data.ball.y + data.ball.dy
        return (
          nx > data.paddleX &&
          nx < data.paddleX + paddleWidth &&
          ny > h - paddleHeight - ballRadius
        )
      },
      ballIsTouchingLeftOrRightEdge(data) {
        const nx = data.ball.x + data.ball.dx
        return nx > w - ballRadius || nx < ballRadius
      },
      ballIsTouchingTopEdge(data) {
        const ny = data.ball.y + data.ball.dy
        return ny < ballRadius
      },
      ballIsTouchingBottomEdge(data) {
        const ny = data.ball.y + data.ball.dy
        return ny > h - ballRadius
      },
      hasLivesRemaining(data) {
        return data.lives >= 0
      },
      paddleCanMoveLeft(data) {
        return data.paddleX > 0
      },
      paddleCanMoveRight(data) {
        return data.paddleX < w - paddleWidth
      },
      allBricksAreDestroyed(data) {
        return data.score === brickColumnCount * brickRowCount
      },
    },
    actions: {
      resetBall(data) {
        Object.assign(data, {
          ball: { x: w / 2, y: h - 30, dx: 2, dy: -2 },
          paddleX: (w - paddleWidth) / 2,
        })
      },
      reset(data) {
        Object.assign(data, {
          bricks: range2d(brickColumnCount, brickRowCount).map((row, y) =>
            row.map((x) => ({
              x: x * (brickWidth + brickPadding) + brickOffsetLeft,
              y: y * (brickHeight + brickPadding) + brickOffsetTop,
              status: 1,
            }))
          ),
          ball: { x: w / 2, y: h - 30, dx: 2, dy: -2 },
          paddleX: (w - paddleWidth) / 2,
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
        data.ball.x += data.ball.dx
        data.ball.y += data.ball.dy
      },
      movePaddleLeft(data) {
        data.paddleX -= 5
      },
      movePaddleRight(data) {
        data.paddleX += 5
      },
      bounceBallX(data) {
        data.ball.dx *= -1
      },
      bounceBallY(data) {
        data.ball.dy *= -1
      },
      increaseScore(data) {
        data.score++
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

  const rCanvas = React.useRef()

  React.useEffect(() => {
    const cvs = rCanvas.current
    const ctx = cvs.getContext("2d")

    function drawBall() {
      ctx.beginPath()
      ctx.arc(state.data.ball.x, state.data.ball.y, ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = "#0095DD"
      ctx.fill()
      ctx.closePath()
    }

    function drawPaddle() {
      ctx.beginPath()
      ctx.rect(state.data.paddleX, h - paddleHeight, paddleWidth, paddleHeight)
      ctx.fillStyle = "#0095DD"
      ctx.fill()
      ctx.closePath()
    }

    function drawBricks() {
      for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
          if (state.data.bricks[c][r].status == 1) {
            var brickX = r * (brickWidth + brickPadding) + brickOffsetLeft
            var brickY = c * (brickHeight + brickPadding) + brickOffsetTop
            state.data.bricks[c][r].x = brickX
            state.data.bricks[c][r].y = brickY
            ctx.beginPath()
            ctx.rect(brickX, brickY, brickWidth, brickHeight)
            ctx.fillStyle = "#0095DD"
            ctx.fill()
            ctx.closePath()
          }
        }
      }
    }

    function drawScore() {
      ctx.font = "16px Arial"
      ctx.fillStyle = "#0095DD"
      ctx.fillText("Score: " + state.data.score, 8, 20)
    }
    function drawLives() {
      ctx.font = "16px Arial"
      ctx.fillStyle = "#0095DD"
      ctx.fillText("Lives: " + state.data.lives, w - 65, 20)
    }

    let frame = 0

    function loop() {
      ctx.clearRect(0, 0, w, h)
      drawBall()
      drawBricks()
      drawPaddle()
      drawScore()
      drawLives()
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <S.Layout w="fit-content">
      <canvas ref={rCanvas} height={h} width={w} />
      <S.Button
        highlight={!state.isIn("playing")}
        onClick={() => state.send("STARTED")}
      >
        {state.whenIn({
          start: "Start",
          playing: "Pause",
          paused: "Resume",
          gameover: "Play Again",
        })}
      </S.Button>
    </S.Layout>
  )
}
