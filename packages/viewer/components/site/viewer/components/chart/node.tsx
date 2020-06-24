import * as React from "react"
import { Flex } from "theme-ui"
import { S, useStateDesigner } from "@state-designer/react"
import { ui } from "../../states/ui"

const Node: React.FC<{ node: S.State<any, any> }> = ({ node, ...rest }) => {
  const local = useStateDesigner(ui)
  const isHinted = local.data.hinted.includes(node.path)
  const isHovered = local.data.hovered === node.path

  return <Flex sx={{}} {...rest} />
}

export default Node
