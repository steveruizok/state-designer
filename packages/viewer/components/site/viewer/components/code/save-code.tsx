// @jsx jsx
import * as React from "react"
import { Box, Text, IconButton, Grid, jsx } from "theme-ui"
import { Circle, Save as SaveIcon, RefreshCcw } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import { editor } from "../../states/editor"

const SaveCode: React.FC = ({}) => {
  const local = useStateDesigner(editor)

  return (
    <Grid
      sx={{
        pl: 2,
        gap: 0,
        gridTemplateColumns: "min-content 1fr min-content min-content",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Box sx={{ color: "accent" }}>
        {local.data.error.length > 0 && <Circle size={10} />}{" "}
      </Box>
      <Text
        sx={{ fontSize: 1, m: 2, whiteSpace: "nowrap", overflow: "hidden" }}
      >
        {local.data.error}
      </Text>
      <IconButton
        title="Save Changes"
        disabled={!local.can("SAVED")}
        onClick={() => local.send("SAVED")}
      >
        <SaveIcon />
      </IconButton>
      <IconButton
        title="Revert Changes"
        disabled={!local.can("CANCELLED")}
        onClick={() => local.send("CANCELLED")}
      >
        <RefreshCcw />
      </IconButton>
    </Grid>
  )
}
export default SaveCode
