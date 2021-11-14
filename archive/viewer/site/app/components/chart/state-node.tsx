import * as React from "react"
import { Flex } from "theme-ui"
import { S } from "@state-designer/react"
import ParallelNode from "./parallel-node"
import BranchNode from "./branch-node"
import LeafNode from "./leaf-node"
import { Highlights } from "../../states/highlights"

const StateNode = React.forwardRef<HTMLDivElement, { node: S.State<any, any> }>(
  ({ node }, ref) => {
    const rContainer = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      Highlights.send("MOUNTED_NODE", { path: node.path, ref: rContainer })
    }, [node])

    return (
      <Flex
        data-type="node-container"
        ref={rContainer}
        sx={{
          minWidth: "fit-content",
        }}
        onMouseOver={(e) => {
          e.stopPropagation()
          Highlights.send("HIGHLIT_STATE", {
            stateName: node.name,
            shiftKey: e.shiftKey,
            path: node.path,
          })
        }}
        onMouseLeave={(e) => {
          e.stopPropagation()
          Highlights.send("CLEARED_STATE_HIGHLIGHT", { stateName: node.name })
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
