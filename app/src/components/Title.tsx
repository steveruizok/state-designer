import React from "react"
import { Box, BoxProps, Text } from "rebass"
import { Plus } from "react-feather"

export interface Props extends BoxProps {
  onCreate?: () => void
}

export const Title: React.FC<Props> = ({ onCreate, children, ...rest }) => {
  return (
    <Box
      sx={{
        position: "relative",
        height: 24,
        display: "grid",
        width: "100%",
        gridTemplateColumns: "auto 1fr auto",
        gridAutoFlow: "column",
        alignItems: "center",
        lineHeight: 1,
        userSelect: "none",
      }}
      {...rest}
    >
      <Box
        sx={{
          position: "absolute",
          borderBottom: "1px dotted #777",
          width: "calc(100%)",
          top: 10,
          zIndex: 1,
        }}
      />
      <Text
        ml={0}
        px={2}
        sx={{
          position: "relative",
          top: "-2px",
          backgroundColor: "background",
          width: "fit-content",
          display: "inline",
          zIndex: 2,
          fontWeight: 600,
          fontSize: 12,
          color: "#333",
        }}
      >
        {children}
      </Text>
      <Box />
      {onCreate && (
        <Box
          px={2}
          sx={{
            zIndex: 2,
            backgroundColor: "background",
          }}
          onClick={onCreate}
        >
          <Plus size={16} />
        </Box>
      )}
    </Box>
  )
}
