import React from "react"
import { Box, Flex, BoxProps } from "rebass"

export interface Props extends BoxProps {}

export const BottomButton: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <Flex
      height={"32px"}
      width={"32px"}
      alignItems="center"
      justifyContent="center"
      backgroundColor="background"
      sx={{
        border: "1px solid #bbb",
        borderRadius: "100%",
        position: "relative",
        zIndex: 2,
        cursor: "pointer",
      }}
      {...rest}
    >
      <Box
        height={24}
        width={35}
        backgroundColor={"background"}
        sx={{
          position: "absolute",
          top: "-7px",
          left: -1,
          zIndes: 0,
        }}
      ></Box>
      <Box sx={{ zIndex: 1 }}>{children}</Box>
    </Flex>
  )
}
