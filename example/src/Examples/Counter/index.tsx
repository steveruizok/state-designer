import React from "react"
import { useStateDesigner } from "state-designer"
import { counter } from "./state"
import Button from "./components/Button"
import Input from "./components/Input"

export interface Props {}

const Counter: React.FC<Props> = ({ children }) => {
  const { data, isIn, getGraph } = useStateDesigner(counter)

  return (
    <div className="example">
      <h2>Counter</h2>
      <p>The count is {isIn("odd") ? "odd" : "even"}.</p>
      <div>
        <div className="button-group">
          <Button event="CLICKED_MINUS">-</Button>
          <span>{data.count}</span>
          <Button event="CLICKED_PLUS">+</Button>
          <div className="input-group">
            <Button event="CLICKED_SET_VALUE">+</Button>
            <Input
              type="number"
              value={data.inputValue}
              onChange="CHANGED_INPUT_VALUE"
            />
          </div>
        </div>
      </div>
      {/* <pre>{JSON.stringify(getGraph(), null, 2)}</pre> */}
    </div>
  )
}

export default Counter
