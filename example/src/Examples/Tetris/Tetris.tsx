import * as React from "react"
import { useStateDesigner } from "state-designer"
import game from "./game"

import { useInputs } from "./hooks/useInputs"

import Background from "./components/Background"
import Screen from "./components/Screen"

import Start from "./scenes/Start"
import Game from "./scenes/Game"
import GameOver from "./scenes/GameOver"

import "./styles.css"

const Tetris: React.FC<{}> = () => {
  const { whenIn } = useStateDesigner(game)

  useInputs()

  return (
    <Background>
      <Screen>
        {whenIn({
          root: <Game key="game" />,
          ready: <Start key="start" />,
          gameover: <GameOver key="gameover" />,
        })}
      </Screen>
    </Background>
  )
}

export default Tetris
