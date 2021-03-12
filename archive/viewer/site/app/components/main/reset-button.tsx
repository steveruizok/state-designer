// @jsx jsx
import * as React from "react"
import { jsx, Button } from "theme-ui"
import { RefreshCw } from "react-feather"
import { S, useStateDesigner } from "@state-designer/react"

const ResetButton: React.FC<{ state: S.DesignedState<any, any> }> = ({
  state,
}) => {
  const local = useStateDesigner(state, [state])

  return (
    <Button
      sx={{
        display: "flex",
        alignItems: "center",
        visibility: local.log.length === 0 ? "hidden" : "visible",
        position: "absolute",
        bottom: 0,
        left: 0,
      }}
      title="Reset State"
      onClick={() => state.reset()}
    >
      <RefreshCw size={16} sx={{ mr: 2 }} /> Reset
    </Button>
  )
}

export default ResetButton
