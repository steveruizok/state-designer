import * as React from "react"
import { Box, BoxProps } from "theme-ui"

const Column: React.FC<BoxProps> = (props) => {
  return <Box {...props} sx={{ p: 2, position: "relative", ...props.sx }} />
}
export default Column
