import React from "react"
import { Box, BoxProps } from "rebass"

export interface Props extends BoxProps {}

export const FlatList: React.FC<Props> = props => {
  return (
    <Box
      p={2}
      {...props}
      sx={{
        display: "grid",
        gridColumn: "span 3",
        gridTemplateColumns: "1fr",
        gridAutoColumns: "64px",
        gridAutoFlow: "column",
        gap: 1,
        ...props.sx
      }}
    />
  )
}
