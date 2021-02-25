import * as React from "react"
import sortBy from "lodash/sortBy"
import { Flex, Card } from "theme-ui"
import { S } from "@state-designer/react"
import NodeHeading from "./node-heading"
import StateNode from "./state-node"
import NodeEvents from "./node-events"

const BranchNode: React.FC<{ node: S.State<any, any> }> = ({ node }) => {
  const childNodes = Object.values(node.states)

  function getSortedBranchChildNodes(nodes: S.State<any, any>[]) {
    return sortBy(
      // sortBy(nodes, (n) => Object.values(n.states).length).reverse(),
      nodes,
      (n) => !n.isInitial
    )
  }

  return (
    <Card
      variant={node.parentType === "parallel" ? "parallelNode" : "node"}
      data-isroot={node.parentType === null}
      data-isactive={node.active}
    >
      <NodeHeading node={node} />
      <NodeEvents node={node} />
      <Flex sx={{ flexWrap: "wrap" }}>
        {getSortedBranchChildNodes(childNodes).map((child, i) => (
          <StateNode key={i} node={child} />
        ))}
      </Flex>
    </Card>
  )
}
export default BranchNode
