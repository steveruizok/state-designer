// @refresh reset
import * as React from "react"
import globalState, { State } from "./state"
import { StateOptionsButton } from "./StateOptionsButton"
import { Row } from "./shared"
import { Button } from "theme-ui"

export const StateListItem: React.FC<{ node: State; depth: number }> = ({
  node,
  depth,
}) => {
  return (
    <Row
      columns={node.id === "root" ? "1fr" : "1fr min-content"}
      sx={{ mb: 0 }}
    >
      <Button
        sx={{ textAlign: "left" }}
        onClick={() => globalState.send("SELECTED_STATE", node.id)}
      >
        {getTreeChars(depth)} {node.name}
      </Button>
      {node.id !== "root" && <StateOptionsButton node={node} />}
    </Row>
  )
}

function getTreeChars(depth: number) {
  let str = ""
  if (depth === 0) return str
  for (let i = 1; i < depth; i++) {
    str += "\u00a0\u00a0\u00a0\u00a0\u00a0"
  }
  return str + "└─"
}
