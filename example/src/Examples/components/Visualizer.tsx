import React from "react"
import { Styled } from "theme-ui"
import { CodeEditor } from "./CodeEditor"
import { Graph } from "./Graph"
import { Card } from "./Card"
import { StateDesigner, useStateDesigner } from "state-designer"
import { Box, Flex, Button } from "@theme-ui/components"

export interface Props {
  title: string
  designer: StateDesigner<any, any, any, any>
}

export const Visualizer: React.FC<Props> = ({ designer, title, children }) => {
  const [data, send, { getGraph, can, reset }] = useStateDesigner(designer)
  const json = JSON.stringify(data, null, 2)

  return (
    <Box>
      <Flex sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Styled.h2>{title}</Styled.h2>
        <Button
          mt={4}
          variant={"flat"}
          onClick={e => {
            e.preventDefault()
            reset()
          }}
        >
          Reset
        </Button>
      </Flex>
      <Card active={true} p={3} mb={4}>
        <CodeEditor
          readOnly
          value={json}
          style={{
            backgroundColor: "#f7f8fa"
          }}
        ></CodeEditor>
      </Card>
      <Graph graph={getGraph()} send={send} can={can}></Graph>
    </Box>
  )
}
