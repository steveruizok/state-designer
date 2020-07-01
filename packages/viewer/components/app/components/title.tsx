import * as React from "react"
import { Flex } from "theme-ui"
import { Project } from "../states"
import { useStateDesigner } from "@state-designer/react"

const Title: React.FC = ({}) => {
  const local = useStateDesigner(Project)
  const captive = useStateDesigner(local.data.captive, [local.data.captive])

  return (
    <Flex
      sx={{
        gridArea: "title",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        borderBottom: "outline",
        borderColor: "border",
      }}
    >
      {captive.id}
    </Flex>
  )
}
export default Title
