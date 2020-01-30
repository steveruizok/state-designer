import * as React from "react"
import { state } from "../state"
import { useStateDesigner } from "state-designer"

type Props = {}

const Graph: React.FC<Props> = ({ children }) => {
  const { graph } = useStateDesigner(state)

  return (
    <pre>
      <code>{JSON.stringify(graph, null, 2)}</code>
    </pre>
  )
}

export default Graph
