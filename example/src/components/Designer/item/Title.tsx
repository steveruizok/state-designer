import React from "react"
import { Box, Text } from "rebass"
import { Plus } from "react-feather"

export interface Props {
  title: string
  onAddItem?: () => void
}

export const Title: React.FC<Props> = ({
  title,
  onAddItem = () => {},
  children
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        height: 24,
        display: "grid",
        width: "100%",
        gridTemplateColumns: "min-content 1fr",
        gridAutoColumns: "fit-content",
        gridAutoFlow: "column",
        alignItems: "center",
        lineHeight: 1
      }}
    >
      <Box
        sx={{
          position: "absolute",
          borderBottom: "1px dashed #777",
          left: -32,
          width: "calc(100% + 64px)",
          top: 11,
          zIndex: 1
        }}
      />
      <Text
        px={2}
        sx={{
          backgroundColor: "background",
          display: "inline",
          zIndex: 2,
          fontWeight: 600,
          textTransform: "uppercase",
          fontSize: 13,
          color: "#333"
        }}
      >
        {title}
      </Text>
      <Box />
      {onAddItem && (
        <Box
          px={2}
          sx={{
            zIndex: 2,
            backgroundColor: "background"
          }}
        >
          <Plus />
        </Box>
      )}
    </Box>
  )
}
