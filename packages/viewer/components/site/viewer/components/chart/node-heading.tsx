// @jsx jsx
import { jsx, Heading, Flex, IconButton } from "theme-ui"
import { S } from "@state-designer/react"
import IconSelect from "../icon-select"
import { Disc, MoreVertical, Maximize, Crosshair } from "react-feather"
import { ui } from "../../states/ui"

const NodeHeading: React.FC<{
  node: S.State<any, any>
  isParallel?: boolean
}> = ({ node, isParallel = false }) => {
  return (
    <Flex
      variant="nodeHeading"
      data-isactive={node.active}
      sx={{
        borderBottom: isParallel ? "outline" : undefined,
      }}
    >
      <Flex sx={{ alignItems: "center", flexGrow: 1 }}>
        {node.isInitial && <Disc strokeWidth={3} size={12} sx={{ mr: 2 }} />}
        <Heading variant={"nodeHeading"}>{node.name}</Heading>
      </Flex>
      <IconSelect
        data-hidey="true"
        icon={<MoreVertical />}
        title="State"
        options={{
          "Zoom to State": () =>
            ui.send("ZOOMED_ON_STATE", { path: node.path }),
          "Force Transition": () => ui.data.captive.forceTransition(node.name),
          "Force Previous Transition": () =>
            ui.data.captive.forceTransition(node.name + ".previous"),
          "Force Restore Transition": () =>
            ui.data.captive.forceTransition(node.name + ".restore"),
        }}
      />
    </Flex>
  )
}

export default NodeHeading
