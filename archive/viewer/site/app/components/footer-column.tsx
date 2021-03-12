import * as React from "react"
import { Box, BoxProps } from "theme-ui"

const FooterColumn: React.FC<BoxProps> = (props) => {
  return <Box {...props} sx={{ p: 2, ...props.sx }} />
}
export default FooterColumn
