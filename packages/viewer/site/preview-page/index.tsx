// @refresh reset
import Link from "next/link"
import { useEffect } from "react"
import * as Utils from "../app/utils"
import { createState, useStateDesigner } from "@state-designer/react"
import { defaultStatics, defaultTheme } from "../static/defaults"
import { ProjectInfo, subscribeToDocSnapshot } from "../../utils/firebase"
import Preview from "../app/components/preview"
import { Flex, IconButton } from "theme-ui"
import { Minimize, ArrowLeft } from "react-feather"
import NotFound404 from "../404"

const PreviewPage: React.FC<{ data: ProjectInfo }> = ({ data }) => {
  const local = useStateDesigner({
    data: {
      oid: data.oid,
      pid: data.pid,
      theme: {} as { [key: string]: any },
      captive: undefined,
      statics: {},
      error: "",
      code: {
        jsx: JSON.parse(data.jsx),
        state: JSON.parse(data.code),
        statics: JSON.parse(
          data.statics.startsWith('"function') ? data.statics : defaultStatics
        ),
        theme: JSON.parse(data.theme || defaultTheme),
      },
    },
    on: {
      SNAPSHOT_UPDATED: [
        "updateFromFirebase",
        "setStaticValues",
        "setCaptiveTheme",
        "setCaptiveState",
      ],
      OPENED_PROJECT: {
        do: [
          "setStaticValues",
          "setCaptiveTheme",
          "setCaptiveState",
          "subscribeToProjectChanges",
        ],
      },
    },
    conditions: {
      hasResponse(d, response) {
        return response !== undefined
      },
    },
    actions: {
      updateFromFirebase(data, { source }) {
        data.code.jsx = JSON.parse(source.jsx)
        data.code.state = JSON.parse(source.code)
        data.code.statics = JSON.parse(
          source.statics?.startsWith('"function')
            ? source.statics
            : defaultStatics
        )
        data.code.theme = JSON.parse(source.theme || defaultTheme)
      },
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
      subscribeToProjectChanges(data) {
        const { pid, oid } = data

        subscribeToDocSnapshot(pid, oid, (doc) => {
          const source = doc.data()
          local.send("SNAPSHOT_UPDATED", { source })
        })
      },
    },
  })

  useEffect(() => {
    if (data) {
      local.send("OPENED_PROJECT", { data })
    }
  }, [data?.pid])

  if (!data) return <NotFound404 />

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {local.data.captive && (
        <Preview
          code={local.data.code.jsx}
          statics={local.data.statics}
          state={local.data.captive}
          theme={local.data.theme}
        />
      )}
      <Flex
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
      >
        <Link href={`/${data.oid}/${data.pid}`}>
          <IconButton sx={{ width: 48, m: 2 }}>
            <ArrowLeft />
          </IconButton>
        </Link>
      </Flex>
    </div>
  )
}

export default PreviewPage
