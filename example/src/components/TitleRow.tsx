import React from "react";
import { Flex, Text } from "rebass";

export interface Props {}

const TitleRow: React.FC<Props> = ({ children }) => {
  return (
    <Flex variant={"titleRow"}>
      <Text variant="heading">{children}</Text>
    </Flex>
  );
};

export default TitleRow;
