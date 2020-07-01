import * as React from "react"
import { Card } from "theme-ui"
import { S } from "@state-designer/react"
import NodeHeading from "./node-heading"

const LeafNode: React.FC<{ node: S.State<any, any> }> = ({ node }) => {
  return (
    <Card
      variant={node.parentType === "parallel" ? "parallelNode" : "node"}
      data-isroot={false}
      data-isactive={node.active}
    >
      <NodeHeading node={node} />
    </Card>
  )
}
export default LeafNode
