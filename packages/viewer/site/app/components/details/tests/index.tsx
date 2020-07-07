import * as React from "react"
import { Styled, Flex, Heading, IconButton, Progress, Box } from "theme-ui"
import { RefreshCcw } from "react-feather"
import { S, useStateDesigner } from "@state-designer/react"
import Test from "./test"

const Tests: React.FC<{
  tests: any[]
}> = ({ tests, children }) => {
  const rContainer = React.useRef<HTMLDivElement>()

  const local = useStateDesigner({
    data: { count: 0, tests: [] },
    initial: "loading",
    states: {
      loading: {
        on: {
          CHANGED_TESTS: { do: "updateTests", to: "running" },
        },
      },
      running: {
        async: {
          await: "runTests",
          onResolve: { to: "complete" },
        },
      },
      complete: {
        on: {
          RESET_TESTS: {
            do: ["incrementCount", "resetResults"],
            to: "running",
          },
          CHANGED_TESTS: {
            do: ["updateTests", "resetResults"],
            to: "running",
          },
        },
      },
    },
    conditions: {
      allTestsComplete(data) {
        return !data.tests.some((test) => test.state === "running")
      },
    },
    actions: {
      incrementCount(data) {
        data.count++
      },
      updateTests(data, { tests }) {
        data.tests = tests
      },
      resetResults(data) {
        for (let test of data.tests) {
          test.state = "running"
        }
      },
      reportPass(data, { index }) {
        data.tests[index].state = "pass"
      },
      reportFail(data, { index }) {
        data.tests[index].state = "fail"
      },
    },
    asyncs: {
      runTests: async (data) => {
        return Promise.all(
          data.tests.map(async (test) => {
            try {
              await test.test()
              test.state = "pass"
            } catch (e) {
              test.state = "fail"
              test.message = e.message
            }
          })
        )
      },
    },
    values: {
      results(data) {
        return {
          passes: data.tests.filter((test) => test.state === "pass").length,
          fails: data.tests.filter((test) => test.state === "fail").length,
        }
      },
    },
  })

  React.useEffect(() => {
    local.send("CHANGED_TESTS", { tests })
  }, [tests])

  const { passes, fails } = local.values.results
  const max = local.data.tests.length

  return (
    <Box
      ref={rContainer}
      sx={{
        overflowX: "hidden",
        overflowY: "scroll",
        borderLeft: "outline",
        borderColor: "border",
        position: "relative",
        p: 0,
      }}
    >
      <Flex
        variant="contentHeading"
        sx={{ position: "sticky", top: 0, left: 0 }}
      >
        <Heading variant="contentHeading">Tests</Heading>
        <IconButton
          data-hidey="true"
          onClick={() => local.send("CHANGED_TESTS", { tests })}
        >
          <RefreshCcw />
        </IconButton>
      </Flex>
      <Box
        sx={{
          fontSize: 1,
          fontFamily: "monospace",
          "& ul": {},
          "& li": {
            p: 2,
            borderBottom: "1px solid",
            borderColor: "border",
            display: "grid",
            gridTemplateColumns: "24px 1fr",
          },
          "& pre": {
            my: 2,
            gridColumn: 2,
            color: "text",
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            pt: 1,
            pb: 3,
            mb: 1,
            position: "relative",
            width: "100%",
          }}
        >
          PASS: {passes} FAIL: {fails} TOTAL: {local.data.tests.length}
          <Progress
            max={1}
            value={passes / max || 0}
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 0,
              height: 2,
              color: "Green",
              bg: "accent",
            }}
          />
        </Box>
        <Styled.ul>
          {local.data.tests.map((test, index) => (
            <Test
              key={index}
              name={test.name}
              state={test.state}
              message={test.message}
            />
          ))}
        </Styled.ul>
      </Box>
      {children}
    </Box>
  )
}

export default Tests
