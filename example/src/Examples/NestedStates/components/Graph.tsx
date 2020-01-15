import * as React from "react"
import { state } from "../state"
import { useStateDesigner } from "state-designer"

type Props = {}

const Graph: React.FC<Props> = ({ children }) => {
  const [data, send, { getGraph }] = useStateDesigner(state)

  return (
    <pre>
      <code>{JSON.stringify(getGraph(), null, 2)}</code>
    </pre>
  )
}

export default Graph
