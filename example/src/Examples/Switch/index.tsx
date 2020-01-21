import React from "react"
import { useStateDesigner } from "state-designer"
import { state } from "./state"

export interface Props {}

const Switch: React.FC<Props> = ({ children }) => {
  const { data, send, isIn } = useStateDesigner(state)

  React.useEffect(() => console.log("changed"), [data])

  return (
    <div className="example">
      <h2>Switch</h2>
      <div onClick={() => send("TOGGLE")}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 40,
            padding: 2,
            height: 40,
            width: 80,
            border: "1px solid #000"
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              height: 36,
              width: 36,
              border: "1px solid #000",
              left: isIn("active") ? 42 : 0,
              transition: "all .2s"
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default Switch
