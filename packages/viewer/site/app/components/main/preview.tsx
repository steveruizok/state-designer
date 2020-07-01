// @jsx jsx
import * as React from "react"
import * as Motion from "framer-motion"
import { useStateDesigner } from "@state-designer/react"
import { motion, MotionValue } from "framer-motion"
import * as Utils from "../../../static/scope-utils"
import { jsx } from "theme-ui"
import * as Icons from "react-feather"
import * as ThemeUI from "theme-ui"
import * as Components from "@theme-ui/components"
import { LiveProvider, LiveError, LivePreview } from "react-live"
import { Project, JsxEditorState } from "../../states"

// Wrap Theme-UI components in Framer Motion
const WithMotionComponents = Object.fromEntries(
  Object.entries(Components).map(([k, v]) => {
    return [k, motion.custom(v as any)]
  })
)

const Preview: React.FC<{}> = ({}) => {
  const project = useStateDesigner(Project)
  const jsxEditor = useStateDesigner(JsxEditorState)

  return (
    <LiveProvider
      code={jsxEditor.data.dirty}
      scope={{
        ...ThemeUI,
        ...Motion,
        ...WithMotionComponents,
        Icons,
        Utils,
        useStateDesigner,
        Static: project.data.statics,
        state: project.data.captive,
      }}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          overflow: "scroll",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          sx={{
            p: 2,
            fontSize: 16,
            position: "relative",
            maxHeight: "100%",
            width: "100%",
            maxWidth: "100%",
            overflow: "scroll",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <LivePreview />
        </motion.div>
        <LiveError
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            m: 0,
            padding: 2,
            width: "100%",
            fontSize: 1,
            height: "min-content",
            fontFamily: "monospace",
            bg: "scrim",
          }}
        />
      </motion.div>
    </LiveProvider>
  )
}

export default Preview
