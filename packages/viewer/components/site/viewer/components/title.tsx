import * as React from "react"
import { Flex } from "theme-ui"
import { ui } from "../states/ui"
import { useStateDesigner } from "@state-designer/react"

const Title: React.FC = ({}) => {
  const local = useStateDesigner(ui)
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
