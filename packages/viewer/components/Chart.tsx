import * as React from "react"
import { S, createState } from "@state-designer/core"
import { useStateDesigner } from "@state-designer/react"
import { State } from "./State"
import { Collection } from "./Collection"

import { Styled } from "theme-ui"
import { Heading, Box, Button, Flex, Card } from "@theme-ui/components"

const state = createState({
  data: { count: 0 },
  initial: "inactive",
  on: {
    RESET: "resetCount",
  },
  states: {
    inactive: {
      on: {
        TURNED_ON: {
          get: [(d) => d.count, (data, payload, result) => result - 1],
          do: [(data, payload, result) => console.log(result)],
          to: () => "active",
        },
      },
    },
    active: {
      repeat: {
        onRepeat: [{ do: "increment" }],
        delay: 1,
      },
      on: {
        TURNED_OFF: { to: "inactive", wait: 1 },
        PLUSSED: [
          {
            do: ["increment", (d) => d.count++],
          },
          {
            do: "increment",
          },
        ],
      },
    },
  },
  actions: {
    increment(d) {
      d.count++
    },
    resetCount(d) {
      d.count = 0
    },
  },
})

export const Chart: React.FC<{}> = () => {
  const { data, send, can, whenIn, stateTree, getDesign } = useStateDesigner(
    state
  )

  const design = React.useMemo(() => {
    return getDesign()
  }, [getDesign])

  return (
    <Box>
      <Card>
        {data.count}
        <Flex>
          <Button
            disabled={!can("TURNED_ON")}
            onClick={() => send("TURNED_ON")}
          >
            turn on
          </Button>
          <Button
            disabled={!can("TURNED_OFF")}
            onClick={() => send("TURNED_OFF")}
          >
            turn off
          </Button>
          <Button disabled={!can("PLUSSED")} onClick={() => send("PLUSSED")}>
            +1
          </Button>
        </Flex>
        Machine is {whenIn({ inactive: "inactive", active: "active" })}
      </Card>
      <hr />
      <Heading>{state.id}</Heading>
      <Styled.ul>
        <Styled.li>
          <State state={stateTree} initial={true} />
        </Styled.li>
      </Styled.ul>
      {design.results && (
        <Collection name="results" collection={design.results} />
      )}
      {design.conditions && (
        <Collection name="conditions" collection={design.conditions} />
      )}
      {design.actions && (
        <Collection name="actions" collection={design.actions} />
      )}
      {design.asyncs && <Collection name="asyncs" collection={design.asyncs} />}
      {design.times && <Collection name="times" collection={design.times} />}
      <Styled.hr />
      <Styled.pre>{JSON.stringify(stateTree, null, 2)}</Styled.pre>
    </Box>
  )
}
