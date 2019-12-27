import React from "react"
import { Box, BoxProps } from "rebass"

export interface Props extends BoxProps {}

export const List: React.FC<Props> = props => {
  return (
    <Box
      {...props}
      sx={{
        display: "grid",
        gridAutoFlow: "row",
        gridTemplateColumns: "1fr",
        columnGap: 4,
        rowGap: 2,
        backgroundColor: "rgba(255, 220, 255, .01)",
        alignItems: "center",
        ...props.sx
      }}
    />
  )
}
