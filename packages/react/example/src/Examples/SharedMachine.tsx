import * as React from "react"
import { createStateDesigner, useStateDesigner } from "state-designer"

const state = createStateDesigner({
  data: {
    count: 0,
  },
  on: {
    INCREMENT_CLICKED: (data) => data.count++,
  },
})

const SharedMachine: React.FC<{}> = () => {
  const { data, send, can } = useStateDesigner(state)

  return (
    <div className="example">
      <h2>Shared Machine</h2>
      <div className="button-group">
        Count: {data.count}
        <ButtonA />
        <ButtonB />
      </div>
    </div>
  )
}

const ButtonA: React.FC<{}> = () => {
  return (
    <button
      onClick={() => {
        state.send("INCREMENT_CLICKED")
      }}
    >
      Increment A
    </button>
  )
}

const ButtonB: React.FC<{}> = () => {
  return (
    <button
      onClick={() => {
        state.send("INCREMENT_CLICKED")
      }}
    >
      Increment B
    </button>
  )
}

export default SharedMachine
