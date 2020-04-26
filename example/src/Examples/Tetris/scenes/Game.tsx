import * as React from "react"

import game from "../game"
import { useStateDesigner } from "state-designer"

import GameGrid from "../components/GameGrid"
import BrickColumn from "../components/BrickColumn"
import Box from "../components/Box"
import TextBox from "../components/TextBox"
import Tetromino from "../components/Tetromino"

type Props = {} & React.HTMLProps<HTMLDivElement>

const Game: React.FC<Props> = () => {
  const { data } = useStateDesigner(game)

  const { current, next } = data

  return (
    <>
      <BrickColumn x={1} />
      <BrickColumn x={12} />
      <GameGrid grid={data.grid} />

      {current && <Tetromino {...current} />}

      <Box x={13} y={1} width={8} height={20} fill={`var(--tetris-dark)`} />
      <TextBox x={14} y={2} width={4} height={2}>
        Level
        <br />
        {data.level}
      </TextBox>
      <TextBox x={14} y={5} width={4} height={2}>
        Lines
        <br />
        {data.lines}
      </TextBox>
      <TextBox x={14} y={8} width={4} height={2}>
        Score
        <br />
        {data.score}
      </TextBox>
      <TextBox x={14} y={11} width={4} height={2}>
        High
        <br />
        {data.highscore}
      </TextBox>

      {next && <Tetromino {...next} origin={{ x: 14, y: 16 }} />}
    </>
  )
}

export default Game
