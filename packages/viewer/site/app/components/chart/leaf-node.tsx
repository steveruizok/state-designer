import * as React from "react"
import { Card } from "theme-ui"
import { S } from "@state-designer/react"
import NodeHeading from "./node-heading"
import NodeEvents from "./node-events"

const LeafNode: React.FC<{ node: S.State<any> }> = ({ node }) => {
  return (
    <Card
      variant={node.parentType === "parallel" ? "parallelNode" : "node"}
      data-isroot={false}
      data-isactive={node.active}
    >
      <NodeHeading node={node} />
      <NodeEvents node={node} />
    </Card>
  )
}
export default LeafNode
