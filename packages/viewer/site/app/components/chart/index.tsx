// @jsx jsx
import * as React from "react"
import { jsx, IconButton } from "theme-ui"
import { getFlatStates } from "../../utils"
import { Minimize } from "react-feather"
import { S, useStateDesigner } from "@state-designer/react"
import { MotionValue, useMotionValue } from "framer-motion"
import StateNode from "./state-node"
import { Project, UI } from "../../states"
import Canvas from "./canvas"

const Chart: React.FC<{
  state: S.DesignedState<any, any>
  zoomedPath: string
}> = ({ state, zoomedPath }) => {
  const mvScale = useMotionValue(1)

  const captive = useStateDesigner(state, [state])

  const states = getFlatStates(captive.stateTree)

  const zoomed = React.useMemo(() => {
    return states.find((node) => node.path === zoomedPath)
  }, [zoomedPath])

  return (
    <Canvas visible={true} mvScale={mvScale}>
      <StateNode node={zoomed || captive.stateTree} />
    </Canvas>
  )
}

export default Chart
