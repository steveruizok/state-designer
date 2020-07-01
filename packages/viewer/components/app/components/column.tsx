import * as React from "react"
import { Flex, BoxProps } from "theme-ui"

const Column: React.FC<BoxProps> = (props) => {
  return (
    <Flex
      {...props}
      sx={{ p: 2, flexDirection: "column", position: "relative", ...props.sx }}
    />
  )
}
export default Column
