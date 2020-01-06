import React from "react"
import { Box, BoxProps } from "rebass"

export interface Props extends BoxProps {}

export const FlatList: React.FC<Props> = props => {
  return (
    <Box
      {...props}
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gridAutoFlow: "column",
        justifyContent: "flex-start",
        // alignItems: "center",
        gap: 1,
        ...props.sx
      }}
    />
  )
}
