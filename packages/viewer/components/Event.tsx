import * as React from "react"
import { S } from "@state-designer/core"

import { Styled } from "theme-ui"
import { Box, Heading } from "@theme-ui/components"

export const SendItem: React.FC<{
  event: S.Event
}> = ({ event }) => {
  return (
    <Box>
      <Heading>event</Heading>
    </Box>
  )
}
