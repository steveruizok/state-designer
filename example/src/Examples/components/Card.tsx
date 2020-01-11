import React from "react"
import { Box, BoxProps } from "@theme-ui/components"

export interface Props extends BoxProps {
  active?: boolean
}

export const Card: React.FC<Props> = ({ sx = {}, active = true, ...rest }) => {
  return (
    <Box
      opacity={active ? 1 : 0.9}
      mb={2}
      backgroundColor="#FFF"
      sx={{
        transition: "all .08s",
        boxShadow: active
          ? "0px 3px 8px rgba(0,0,0,.09)"
          : "0px 3px 8px rgba(0,0,0,.06)",
        border: active ? "1px solid #555" : "1px solid #bbb",
        borderRadius: 4,
        overflow: "hidden",
        "&:last-child": {
          mr: 0
        },
        ...sx
      }}
      {...rest}
    />
  )
}
