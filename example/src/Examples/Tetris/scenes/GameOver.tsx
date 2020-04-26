import * as React from "react"
import TextBox from "../components/TextBox"
import game from "../game"

type Props = {} & React.HTMLProps<HTMLDivElement>

const GameOver: React.FC<Props> = () => {
  return (
    <>
      <TextBox x={3} y={6} width={14} height={3} fontSize={20}>
        Game over!
      </TextBox>
      <TextBox x={4} y={12} width={12} height={6} fontSize={20}>
        Click to
        <br />
        Play Again
      </TextBox>
      <div
        style={{ gridColumn: `1 / -1`, gridRow: `1 / -1` }}
        onClick={() => game.send("GAME_STARTED")}
      />
    </>
  )
}

export default GameOver
