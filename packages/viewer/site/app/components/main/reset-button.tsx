// @jsx jsx
import * as React from "react"
import { jsx, IconButton } from "theme-ui"
import { RefreshCw } from "react-feather"
import { S, useStateDesigner } from "@state-designer/react"

const ResetButton: React.FC<{ state: S.DesignedState<any, any> }> = ({
  state,
}) => {
  const local = useStateDesigner(state, [state])

  return (
    <IconButton
      sx={{
        visibility: local.log.length === 0 ? "hidden" : "visible",
        position: "absolute",
        bottom: 0,
        right: 0,
      }}
      title="Reset State"
      onClick={() => state.reset()}
    >
      <RefreshCw />
    </IconButton>
  )
}

export default ResetButton
