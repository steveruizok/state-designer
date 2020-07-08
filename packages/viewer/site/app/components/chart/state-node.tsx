import * as React from "react"
import { Flex } from "theme-ui"
import { S } from "@state-designer/react"
import ParallelNode from "./parallel-node"
import BranchNode from "./branch-node"
import LeafNode from "./leaf-node"
import { Highlights } from "../../states/highlights"

const StateNode = React.forwardRef<HTMLDivElement, { node: S.State<any, any> }>(
  ({ node }, ref) => {
    return (
      <Flex
        ref={ref}
        sx={{ minWidth: "fit-content" }}
        onMouseOver={(e) => {
          e.stopPropagation()
          Highlights.send("HIGHLIT_STATE", {
            stateName: node.name,
            shiftKey: e.shiftKey,
          })
        }}
        onMouseLeave={(e) => {
          e.stopPropagation()
          Highlights.send("CLEARED_HIGHLIGHT")
        }}
      >
        {node.type === "parallel" ? (
          <ParallelNode node={node} />
        ) : node.type === "branch" ? (
          <BranchNode node={node} />
        ) : (
          <LeafNode node={node} />
        )}
      </Flex>
    )
  }
)

export default StateNode
