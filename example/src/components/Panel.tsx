import React from "react";
import { Box } from "rebass";

export interface Props {}

const Panel: React.FC<Props> = ({ children }) => {
  return (
    <Box
      bg="gray80"
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 375,
        height: "100vh",
        display: "grid",
        gridAutoFlow: "row",
        gridAutoRows: "min-content",
        flexDirection: "flex-start"
      }}
    >
      {children}
    </Box>
  );
};

export default Panel;
