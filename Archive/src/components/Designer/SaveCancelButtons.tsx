import React from "react"
import { Button } from "./Inputs"
import { Box } from "rebass"

export interface Props {
  canSave: boolean
  onCancel: () => void
  onSave: () => void
}

export const SaveCancelButtons: React.FC<Props> = ({
  canSave,
  onCancel,
  onSave
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridAutoFlow: "column",
        gap: 1
      }}
    >
      <Button onClick={onCancel}>Cancel</Button>
      <Button disabled={!canSave} onClick={onSave}>
        Save
      </Button>
    </Box>
  )
}
