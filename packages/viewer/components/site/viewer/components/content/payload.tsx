// @jsx jsx
import * as React from "react"
import { Grid, Input, Textarea, Flex, jsx, Heading, IconButton } from "theme-ui"
import { ChevronDown, ChevronUp } from "react-feather"
import { motion } from "framer-motion"

const Payload: React.FC<{ title: string }> = ({ title, children }) => {
  return (
    <Grid
      sx={{
        gridTemplateColumns: "1fr",
        gridTemplateRows: "40px 1fr 40px",
        alignSelf: "flex-end",
      }}
    >
      <Flex variant="contentHeading">
        <Heading variant="contentHeading">Payload</Heading>
      </Flex>
      <Textarea></Textarea>
    </Grid>
  )
}

export default Payload
