// @refresh reset
import * as React from "react"
import Link from "next/link"
import { useEffect } from "react"
import * as Utils from "../app/utils"
import { createState, useStateDesigner } from "@state-designer/react"
import { defaultStatics, defaultTheme } from "../static/defaults"
import { UI } from "../app/states"
import { ProjectInfo, subscribeToDocSnapshot } from "../../utils/firebase"
import Chart from "../app/components/chart"
import { Flex, IconButton } from "theme-ui"
import { Minimize, ArrowLeft } from "react-feather"
import NotFound404 from "../404"

const ChartPage: React.FC<{ data: ProjectInfo }> = ({ data }) => {
  const ui = useStateDesigner(UI)
  const local = useStateDesigner({
    data: {
      oid: data.oid,
      pid: data.pid,
      theme: {} as { [key: string]: any },
      captive: createState({}),
      statics: {},
      error: "",
      code: {
        jsx: JSON.parse(data.jsx),
        state: JSON.parse(data.code),
        statics: JSON.parse(
          data.static.startsWith('"function') ? data.static : defaultStatics
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
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Chart state={local.data.captive} zoomedPath={ui.data.zoomedPath} />

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
        {ui.data.zoomedPath &&
          ui.data.zoomedPath !== local.data.captive.stateTree.path && (
            <IconButton
              sx={{ width: 48, m: 2 }}
              onClick={() => ui.send("ZOOMED_OUT")}
            >
              <Minimize />
            </IconButton>
          )}
      </Flex>
    </div>
  )
}

export default ChartPage
