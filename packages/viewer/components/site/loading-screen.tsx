import * as React from "react"
import { Flex, Spinner, Box, BoxProps } from "theme-ui"

const LoadingScreen: React.FC<BoxProps> = ({ children, ...props }) => {
  return (
    <Flex
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        placeItems: "center",
        placeContent: "center",
        textAlign: "center",
        margin: 0,
        flexDirection: "column",
      }}
      {...props}
    >
      <Spinner sx={{ color: "text", mb: 5 }} />
      <Box>{children}</Box>
    </Flex>
  )
}

export default LoadingScreen
