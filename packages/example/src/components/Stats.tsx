import * as React from "react"
import { useStateDesign, StateGraph } from "@state-designer/react"
import game from "../game"

const Stats: React.FC = () => {
  const { data } = useStateDesign(game)

  // const active = getActive(stateTree)

  return (
    <div className="Stats">
      <div>Score: {data.score}</div>
      <div>Level: {data.level}</div>
      <div>Lines: {data.lines}</div>
      <hr />
      <StateGraph state={game} />
    </div>
  )
}

export default Stats
