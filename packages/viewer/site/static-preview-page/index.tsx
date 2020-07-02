// @refresh reset
import * as React from "react"
import { useEffect } from "react"
import * as Utils from "../app/utils"
import { createState, useStateDesigner } from "@state-designer/react"
import { defaultStatics, defaultTheme } from "../static/defaults"
import { ProjectInfo } from "../../utils/firebase"
import Preview from "../app/components/preview"
import { Box } from "theme-ui"
import NotFound404 from "../404"

const StaticPreviewPage: React.FC<{ data: ProjectInfo }> = ({ data }) => {
  const local = useStateDesigner({
    data: {
      oid: data.oid,
      pid: data.pid,
      theme: {} as { [key: string]: any },
      captive: createState({}),
      statics: {},
      error: "",
      code: {
        state: JSON.parse(data.code),
        jsx: JSON.parse(data.jsx),
        theme: JSON.parse(data.theme || defaultTheme),
        statics: JSON.parse(
          data.statics?.startsWith('"function') ? data.statics : defaultStatics
        ),
      },
    },
    onEnter: {
      if: "hasResponse",
      do: ["setStaticValues", "setCaptiveTheme", "setCaptiveState"],
    },
    conditions: {
      hasResponse(_, response) {
        return response !== undefined
      },
    },
    actions: {
      setStaticValues(data) {
        const { statics } = data.code

        try {
          data.statics = Function("Utils", `return ${statics}()`)(Utils)
          data.error = ""
        } catch (err) {
          console.warn("Error building statics", err)
          data.error = err.message
        }
      },
      setCaptiveTheme(data) {
        const { theme } = data.code

        if (!theme) return

        try {
          const code = theme.slice(14)
          data.theme = Function("Static", `return ${code}`)(data.statics)
          data.error = ""
        } catch (err) {
          console.warn("Error building theme", err)
          data.error = err.message
        }
      },
      setCaptiveState(data) {
        const { state } = data.code

        let code = state.slice(12, -2) // trim createState call

        try {
          data.captive = Function(
            "fn",
            "Static",
            "Utils",
            `return fn(${code})`
          )(createState, data.statics, Utils)
          data.error = ""
        } catch (err) {
          console.warn("Error building captive state", err)
          data.error = err.message
        }
      },
    },
  })

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Preview
        code={local.data.code.jsx}
        statics={local.data.statics}
        state={local.data.captive}
        theme={local.data.theme}
      />
    </div>
  )
}

export default StaticPreviewPage
