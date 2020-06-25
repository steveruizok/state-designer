import * as React from "react"
import { Flex } from "theme-ui"
import { S } from "@state-designer/core"
import ParallelNode from "./parallel-node"
import BranchNode from "./branch-node"
import LeafNode from "./leaf-node"
import { editor } from "../../states/editor"

const StateNode: React.FC<{ node: S.State<any, any> }> = ({ node }) => {
  return (
    <Flex
      onMouseOver={(e) => {
        e.stopPropagation()
        editor.send("HOVERED_STATE", { stateName: node.name })
      }}
      onMouseLeave={(e) => {
        e.stopPropagation()
        editor.send("UNHOVERED_STATE")
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
export default StateNode
