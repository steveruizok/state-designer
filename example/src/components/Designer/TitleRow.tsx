import React from "react"
import { Flex, FlexProps } from "rebass"

export interface Props extends FlexProps {}

export const TitleRow: React.FC<Props> = props => {
  return <Flex justifyContent="space-between" mb={2} {...props} />
}
