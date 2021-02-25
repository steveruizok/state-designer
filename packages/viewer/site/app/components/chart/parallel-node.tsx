import * as React from "react"
import { Grid, Card } from "theme-ui"
import sortBy from "lodash/sortBy"
import { S, useStateDesigner } from "@state-designer/react"
import NodeHeading from "./node-heading"
import StateNode from "./state-node"
import ParallelDivider from "./parallel-divider"
import NodeEvents from "./node-events"

const ParallelNode: React.FC<{ node: S.State<any> }> = ({ node }) => {
  const childNodes = Object.values(node.states)

  function getSortedParallelChildNodes(nodes: S.State<any>[]) {
    return nodes
    // return sortBy(nodes, (n) => Object.entries(n.states).length)
  }

  return (
    <Card
      variant={node.parentType === "parallel" ? "parallelNode" : "node"}
      data-isroot={node.parentType === null}
      data-isactive={node.active}
    >
      <NodeHeading node={node} isParallel={true} />
      <NodeEvents node={node} />
      <Grid
        sx={{
          width: "fit-content",
          gridAutoColumns: "fit-content",
          gap: 0,
          gridAutoFlow: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {getSortedParallelChildNodes(childNodes).map((child, i) => {
          return (
            <React.Fragment key={i}>
              <StateNode node={child} />
              {i < childNodes.length - 1 && (
                <ParallelDivider isActive={node.active} />
              )}
            </React.Fragment>
          )
        })}
      </Grid>
    </Card>
  )
}
export default ParallelNode
