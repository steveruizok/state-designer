import React from "react"
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
  useKeyboardInputs({
    onKeyDown: {},
    onKeyUp: {},
  })

  const rCanvas = React.useRef()

  React.useEffect(() => {
    const cvs = rCanvas.current
    const ctx = cvs.getContext("2d")
  }, [])

  return (
    <S.Layout w="fit-content">
      <canvas ref={rCanvas} height={h} width={w} />
      <S.Button highlight={false}>Start</S.Button>
    </S.Layout>
  )
}
