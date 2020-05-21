import * as React from "react"
import { useStateDesigner, S } from "@state-designer/react"
import game from "../game"

const Stats: React.FC = () => {
  const { data, stateTree } = useStateDesigner(game)

  // const active = getActive(stateTree)

  return (
    <div className="Stats">
      <div>Score: {data.score}</div>
      <div>Level: {data.level}</div>
      <div>Lines: {data.lines}</div>
      <hr />
      states:
      <ul>
        <Node state={stateTree} />
      </ul>
    </div>
  )
}

export default Stats

/* ---------------- Active State Tree --------------- */

type ActiveNode = { name: string; children: ActiveNode[] }

function getActive(state: S.State<any>): ActiveNode {
  return {
    name: state.name,
    children: Object.values(state.states)
      .filter((state) => state.active)
      .map((state) => getActive(state)),
  }
}

const Node: React.FC<{ state: S.State<any> }> = ({ state }) => {
  const states = Object.values(state.states)
  return (
    <li style={{ color: state.active ? "var(--gb-accent)" : "#000" }}>
      {state.name}
      {states.length > 0 && (
        <ul>
          {states.map((child, i) => (
            <Node key={i} state={child} />
          ))}
        </ul>
      )}
    </li>
  )
}
