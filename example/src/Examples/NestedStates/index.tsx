import React from "react"
import { useStateDesigner } from "state-designer"
import { state } from "./state"
import Graph from "./components/Graph"
import Button from "./components/Button"

export interface Props {}

const NestedState: React.FC<Props> = ({ children }) => {
  const { data, isIn } = useStateDesigner(state)

  return (
    <div className="example">
      <h2>Nested States</h2>
      {isIn("inactive") ? (
        <p>The machine is off.</p>
      ) : (
        <p>The machine is on. The count is {isIn("odd") ? "odd" : "even"}.</p>
      )}
      <div>
        <div className="button-group">
          <div className="segmented-button-group">
            <Button event="TURN_OFF">Off</Button>
            <Button event="TURN_ON">On</Button>
          </div>
          <div className="button-group">
            <Button event="CLICKED_MINUS">-</Button>
            <span>{data.count}</span>
            <Button event="CLICKED_PLUS">+</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NestedState
