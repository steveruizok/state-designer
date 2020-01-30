import * as React from "react"
import { state } from "../state"
import { useStateDesigner } from "state-designer"

type Props = {
  event: string
  payload?: any
}

const Graph: React.FC<Props> = ({ event, payload, children }) => {
  const { graph } = useStateDesigner(state)

  return (
    <pre>
      <code>{JSON.stringify(graph, null, 2)}</code>
    </pre>
  )
}

export default Graph
