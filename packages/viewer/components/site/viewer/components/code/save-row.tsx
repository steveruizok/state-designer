// @jsx jsx
import { Box, Text, IconButton, Grid, jsx } from "theme-ui"
import {
  Circle,
  Save as SaveIcon,
  RefreshCcw,
  AlertOctagon,
} from "react-feather"
import { S, useStateDesigner } from "@state-designer/react"

const SaveRow: React.FC<{ state: S.DesignedState<any, any> }> = ({ state }) => {
  const local = useStateDesigner(state)

  return (
    <Grid
      sx={{
        pl: 2,
        gap: 0,
        gridTemplateColumns: "min-content 1fr min-content min-content",
        alignItems: "center",
        width: "100%",
        borderTop: "outline",
        borderColor: "border",
        position: "relative",
        zIndex: 999,
      }}
    >
      <Box sx={{ color: "accent" }}>
        {local.data.error.length > 0 && (
          <AlertOctagon size={14} sx={{ mt: "6px" }} />
        )}{" "}
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
export default SaveRow
