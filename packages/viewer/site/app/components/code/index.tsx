import * as React from "react"
import Column from "../column"
import {
  Project,
  StateEditorState,
  JsxEditorState,
  StaticsEditorState,
} from "../../states"
import { initMonaco } from "./monaco"
import { useStateDesigner } from "@state-designer/react"
import JsxEditor from "./jsx-editor"
import StateEditor from "./state-editor"
import StaticEditor from "./static-editor"
import SaveRow from "./save-row"
import { motion } from "framer-motion"

const CodeColumn: React.FC<{ authenticated: boolean; owner: boolean }> = ({
  authenticated,
  owner,
}) => {
  const local = useStateDesigner(Project)
  const canEdit = authenticated && owner

  React.useEffect(() => {
    initMonaco()
  }, [])

  return (
    <Column
      sx={{
        gridArea: "code",
        position: "relative",
        p: 0,
        borderLeft: "outline",
        borderColor: "border",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "100% 100% 100% 100%",
          gridTemplateRows: "1fr auto",
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 800,
          restDelta: 1,
          restSpeed: 1,
          mass: 0.9,
        }}
        variants={{
          state: { x: 0 },
          jsx: { x: "-100%" },
          static: { x: "-200%" },
          tests: { x: "-300%" },
        }}
        animate={local.whenIn({
          state: "state",
          jsx: "jsx",
          static: "static",
          tests: "tests",
        })}
      >
        <StateEditor readOnly={!canEdit} />
        <JsxEditor readOnly={!canEdit} />
        <StaticEditor readOnly={!canEdit} />
        {canEdit && <SaveRow state={StateEditorState} />}
        {canEdit && <SaveRow state={JsxEditorState} />}
        {canEdit && <SaveRow state={StaticsEditorState} />}
      </motion.div>
    </Column>
  )
}

export default CodeColumn
