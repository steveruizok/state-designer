import React from "react"
import { useStateDesigner } from "@state-designer/react"
import { Snake as S } from "components"
import { useKeyboardInputs } from "utils"

export default function () {
  const state = useStateDesigner({
    data: {
      snake: {
        head: {
          x: 4,
          y: 4,
        },
        facing: 1,
        tail: [],
        length: 1,
      },
      apple: {
        x: 9,
        y: 4,
      },
    },
    initial: "start",
    states: {
      start: {
        onEnter: "resetGame",
        on: {
          STARTED: { to: "playing" },
        },
      },
      playing: {
        on: {
          STARTED: { to: "paused" },
          TURNED: {
            unlessAny: ["nextFacingIsCurrentFacing", "nextFacingIsReverse"],
            do: "changeFacing",
          },
        },
        repeat: {
          onRepeat: [
            "moveSnakeForward",
            {
              if: "snakeBitItself",
              to: "gameover",
            },
            "updateSnakeTail",
            {
              if: "snakeBitApple",
              do: ["lengthenSnake", "resetApple"],
            },
          ],
          delay: 0.1,
        },
      },
      paused: {
        on: {
          STARTED: { to: "playing" },
        },
      },
      gameover: {
        on: {
          STARTED: {
            do: "resetGame",
            to: "playing",
          },
        },
      },
    },
    conditions: {
      nextFacingIsCurrentFacing(data, payload) {
        return data.snake.facing === payload
      },
      nextFacingIsReverse(data, payload) {
        return Math.abs(data.snake.facing - payload) === 2
      },
      snakeBitItself(data) {
        const { x, y } = data.snake.head

        return data.snake.tail.find((p) => p.x === x && p.y === y)
      },
      snakeBitApple(data) {
        const { x: sx, y: sy } = data.snake.head
        const { x: ax, y: ay } = data.apple
        return sx === ax && sy === ay
      },
    },
    actions: {
      resetGame(data) {
        data.snake = {
          head: {
            x: Math.floor(Math.random() * 19),
            y: Math.floor(Math.random() * 19),
          },
          facing: 1,
          tail: [],
          length: 0,
        }

        function getOpenPosition() {
          let x = Math.floor(Math.random() * 19)
          let y = Math.floor(Math.random() * 19)

          if (data.snake.x === x && data.snake.y === y) {
            return getOpenPosition()
          }

          return { x, y }
        }

        data.apple = getOpenPosition()
      },
      moveSnakeForward(data) {
        const { head, facing, tail, length } = data.snake

        // Move head according to facing
        if (facing === 0) head.y -= 1
        if (facing === 1) head.x += 1
        if (facing === 2) head.y += 1
        if (facing === 3) head.x -= 1

        const min = 0
        const max = 19

        // Wrap head around matrix
        if (head.x < min) head.x = max
        if (head.x > max) head.x = min
        if (head.y < min) head.y = max
        if (head.y > max) head.y = min
      },
      lengthenSnake(data) {
        data.snake.length++
      },
      updateSnakeTail(data) {
        const { head, tail, length } = data.snake

        // Add head cell to start of tail
        tail.unshift({ ...head })

        // Trim tail to length
        data.snake.tail = tail.slice(0, length)
      },
      changeFacing(data, payload) {
        data.snake.facing = payload
      },
      resetApple(data) {
        const { x: sx, y: sy } = data.snake.head

        function getOpenPosition() {
          let x = Math.floor(Math.random() * 19)
          let y = Math.floor(Math.random() * 19)

          if (sx === x && sy === y) {
            return getOpenPosition()
          }

          if (data.snake.tail.find((p) => p.x === x && p.y === y)) {
            return getOpenPosition()
          }

          return { x, y }
        }

        data.apple = getOpenPosition()
      },
    },
  })

  useKeyboardInputs({
    onKeyDown: {
      " ": () => state.send("STARTED"),
      ArrowUp: () => state.send("TURNED", 0),
      ArrowRight: () => state.send("TURNED", 1),
      ArrowDown: () => state.send("TURNED", 2),
      ArrowLeft: () => state.send("TURNED", 3),
    },
  })

  return (
    <S.Layout>
      <S.PlayField>
        <S.Layer>
          {state.data.snake.tail.map((cell, i) => (
            <S.Cell
              key={i}
              x={cell.x}
              y={cell.y}
              color={i % 3 === 0 ? "orange" : "red"}
            />
          ))}
          <S.Cell
            x={state.data.snake.head.x}
            y={state.data.snake.head.y}
            color="yellow"
          />
          <S.Cell x={state.data.apple.x} y={state.data.apple.y} color="green" />
        </S.Layer>
      </S.PlayField>
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
