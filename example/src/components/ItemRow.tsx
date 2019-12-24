import React from "react";
import { Box, Text } from "rebass";

export interface Props {}

const RowItem: React.FC<Props> = ({ children }) => {
  return (
    <Box variant={"rowItem"}>
      <Text>{children}</Text>
    </Box>
  );
};

export default RowItem;
