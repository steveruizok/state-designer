import * as React from "react"
import { S, createStateDesigner } from "@state-designer/core"
import { useStateDesigner } from "@state-designer/react"
import { State } from "./State"
import { Collection } from "./Collection"

import { Styled } from "theme-ui"
import { Heading, Box, Button, Flex, Card } from "@theme-ui/components"

const state = createStateDesigner({
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
        event: [{ do: "increment" }],
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
  const { data, send, can, whenIn, stateTree, getConfig } = useStateDesigner(
    state
  )

  const config = React.useMemo(() => {
    return getConfig()
  }, [getConfig])

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
      {config.results && (
        <Collection name="results" collection={config.results} />
      )}
      {config.conditions && (
        <Collection name="conditions" collection={config.conditions} />
      )}
      {config.actions && (
        <Collection name="actions" collection={config.actions} />
      )}
      {config.asyncs && <Collection name="asyncs" collection={config.asyncs} />}
      {config.times && <Collection name="times" collection={config.times} />}
      <Styled.hr />
      <Styled.pre>{JSON.stringify(stateTree, null, 2)}</Styled.pre>
    </Box>
  )
}
