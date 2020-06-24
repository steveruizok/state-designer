import * as React from "react"
import { sortBy } from "lodash"
import { Save, RefreshCcw } from "react-feather"
import Link from "next/link"
import {
  Styled,
  Input,
  IconButton,
  Button,
  Grid,
  BoxProps,
  ButtonProps,
  Box,
  Flex,
  Heading,
} from "theme-ui"
import { Disc, Circle } from "react-feather"
import { S, createState, useStateDesigner } from "@state-designer/react"
import { CodeEditor } from "./code-editor"

/* --------------------- States --------------------- */

const counter = `{
  data: { count: 0 },
  on: {
    DECREASED: { 
      unless: "countIsAtMin", 
      do: "decrementCount" 
    },
    INCREASED: { 
      unless: "countIsAtMax", 
      do: "incrementCount" 
    },
  },
  actions: {
    decrementCount(data) {
      data.count--
    },
    incrementCount(data) {
      data.count++
    },
  },
  conditions: {
    countIsAtMin(data) {
      return data.count === 0
    },
    countIsAtMax(data) {
      return data.count === 5
    },
  },
}`

const todo = `{
  data: {
    content: "",
    complete: false,
  },
  initial: complete ? "complete" : "incomplete",
  states: {
    incomplete: {
      initial: {
        if: "contentIsEmpty",
        to: "empty",
        else: { to: "full" },
      },
      states: {
        empty: {
          on: {
            CHANGED_CONTENT: {
              unless: "contentIsEmpty",
              to: "full",
            },
          },
        },
        full: {
          on: {
            TOGGLED_COMPLETE: {
              to: "complete",
              do: "setComplete",
            },
            CHANGED_CONTENT: {
              if: "contentIsEmpty",
              to: "empty",
            },
          },
        },
      },
      on: {
        CHANGED_CONTENT: "updateContent",
      },
    },
    complete: {
      on: {
        TOGGLED_COMPLETE: {
          do: "clearComplete",
          to: "incomplete",
        },
      },
    },
  },
  conditions: {
    contentIsEmpty(data) {
      return data.content === ""
    },
  },
  actions: {
    setComplete(data) {
      data.complete = true
    },
    clearComplete(data) {
      data.complete = false
    },
    updateContent(data, payload) {
      data.content = payload
    },
  },
}`

const player = `{
  data: {
    ms: 0,
    duration: 60000,
  },
  states: {
    volume: {
      initial: "low",
      states: {
        high: {},
        low: {},
      },
    },
    music: {
      initial: "stopped",
      states: {
        stopped: {
          on: {
            PRESSED_PLAY: {
              unless: "atEnd",
              to: "playing",
            },
            PRESSED_RW: {
              unless: "atStart",
              to: "rewinding",
            },
            PRESSED_FF: {
              unless: "atEnd",
              to: "fastForwarding",
            },
          },
        },
        playing: {
          initial: "normal",
          on: {
            PRESSED_STOP: { to: "stopped" },
            HELD_RW: { to: "scrubbing.back" },
            HELD_FF: { to: "scrubbing.forward" },
          },
          states: {
            normal: {
              repeat: {
                onRepeat: [
                  {
                    if: "atEnd",
                    to: "stopped",
                  },
                  {
                    get: "interval",
                    do: "addIntervalToCurrentTime",
                  },
                ],
              },
              on: {
                PRESSED_PAUSE: { to: "paused" },
              },
            },
            paused: {
              on: {
                PRESSED_PLAY: { to: "normal" },
              },
            },
          },
        },
        scrubbing: {
          on: {
            STOPPED_SCRUBBING: { to: "playing.restore" },
            RELEASED: { to: "playing.restore" },
            PRESSED_RW: { to: "playing.restore" },
            PRESSED_FF: { to: "playing.restore" },
          },
          initial: "manual",
          states: {
            manual: {},
            forward: {
              repeat: {
                onRepeat: [
                  {
                    if: "atEnd",
                    to: "stopped",
                  },
                  {
                    get: "fastInterval",
                    do: "addIntervalToCurrentTime",
                  },
                ],
              },
            },
            back: {
              repeat: {
                onRepeat: [
                  {
                    if: "atStart",
                    to: "stopped",
                  },
                  {
                    get: "fastInterval",
                    do: "subtractIntervalFromCurrentTime",
                  },
                ],
              },
            },
          },
        },
        fastForwarding: {
          repeat: {
            onRepeat: [
              {
                if: "atEnd",
                to: "stopped",
              },
              {
                get: "veryFastInterval",
                do: "addIntervalToCurrentTime",
              },
            ],
          },
          on: {
            PRESSED_PLAY: { to: "playing" },
            PRESSED_STOP: { to: "stopped" },
            PRESSED_RW: { to: "rewinding" },
          },
        },
        rewinding: {
          repeat: {
            onRepeat: [
              {
                if: "atStart",
                to: "stopped",
              },
              {
                get: "veryFastInterval",
                do: "subtractIntervalFromCurrentTime",
              },
            ],
          },
          on: {
            PRESSED_PLAY: { to: "playing" },
            PRESSED_STOP: { to: "stopped" },
            PRESSED_FF: { to: "fastForwarding" },
          },
        },
      },
    },
  },
  results: {
    interval(data, payload, result) {
      return result.interval
    },
    fastInterval(data, payload, result) {
      return result.interval * 10
    },
    veryFastInterval(data, payload, result) {
      return result.interval * 32
    },
  },
  conditions: {
    atStart(data) {
      return data.ms <= 0
    },
    atEnd(data) {
      return data.ms >= data.duration
    },
  },
  actions: {
    setProgress(data, payload) {
      data.ms = data.duration * (payload / 100)
    },
    addIntervalToCurrentTime(data, payload, result) {
      const delta = Math.min(data.duration - data.ms, result)
      data.ms += delta
    },
    subtractIntervalFromCurrentTime(data, payload, result) {
      const delta = Math.min(data.ms, result)
      data.ms -= delta
    },
  },
  values: {
    progress(data) {
      return data.ms / data.duration
    },
    minutes(data) {
      const m = Math.floor(data.ms / 60000)
      return m.toString().padStart(2, "0")
    },
    seconds(data) {
      const s = Math.floor(data.ms / 1000) % 60
      return s.toString().padStart(2, "0")
    },
  },
}`

const toggle = `{
  initial: "toggledOff",
  states: {
    toggledOff: {
      on: { TOGGLED: { to: "toggledOn" } },
    },
    toggledOn: {
      on: { TOGGLED: { to: "toggledOff" } },
    },
  },
}`

/* ---------------------- Main ---------------------- */

type UIData = {
  code: string
  captive?: S.DesignedState<any, any>
  hovered?: string
  error: string
  hinted: string[]
  active: string[]
  current: string
}

const initialData: UIData = {
  code: player,
  error: "",
  captive: undefined,
  hovered: undefined,
  hinted: [],
  active: [],
  current: "root",
}

export const codeEditor = createState({
  data: {
    clean: "",
    dirty: "",
    error: "",
  },
  initial: "idle",
  states: {
    idle: {
      on: { STARTED_EDITING: { to: "editing" } },
    },
    editing: {
      on: {
        CHANGED_CODE: ["setCode", "setError", { to: "editing" }],
      },
      initial: {
        if: "codeMatchesClean",
        to: "same",
        else: {
          if: ["codeIsValid", "errorIsClear"],
          to: "valid",
          else: { to: "invalid" },
        },
      },
      states: {
        same: {
          on: {
            STOPPED_EDITING: { to: "idle" },
          },
        },
        valid: {
          on: {
            CANCELLED: { do: "resetCode", to: "idle" },
            QUICK_SAVED: ["saveDirtyToClean", { to: "editing" }],
            SAVED: { do: "shareCode", to: "idle" },
          },
        },
        invalid: {
          on: {
            CANCELLED: { do: ["resetCode", "clearError"], to: "idle" },
          },
        },
      },
    },
  },
  on: {
    LOADED_CODE: ["setCleanCode", "setCode"],
  },
  conditions: {
    codeIsValid() {
      return true // validate === undefined ? true : validate(data.dirty)
    },
    codeMatchesClean(data) {
      return data.dirty === data.clean
    },
    errorIsClear(data) {
      return data.error === ""
    },
  },
  actions: {
    setCleanCode(data, payload) {
      data.clean = payload
    },
    setCode(data, payload) {
      data.dirty = payload
    },
    resetCode(data) {
      data.dirty = data.clean
    },
    saveDirtyToClean(data) {
      data.clean = data.dirty
    },
    clearError(data) {
      data.error = ""
    },
    setError(d) {
      let error: string = ""

      try {
        Function("fn", `const test = fn(${d.dirty})`)(createState)
      } catch (e) {
        error = e.message
      }

      d.error = error
    },
    shareCode(data) {
      ui.send("CHANGED_CODE", { code: data.dirty })
    },
  },
})

export const ui = createState({
  data: initialData,
  initial: "chart",
  states: {
    chart: {},
    code: {},
  },
  on: {
    HOVERED_ON_NODE: {
      do: ["clearHoveredNode", "setHoveredNode"],
    },
    HOVERED_OFF_NODE: {
      do: "clearHoveredNode",
    },
    HOVERED_ON_EVENT: {
      do: ["clearHintedNodes", "setHintedNodes"],
    },
    HOVERED_OFF_EVENT: {
      do: "clearHintedNodes",
    },
    SELECTED_NODE: {
      do: "setCurrentNode",
    },
    CHANGED_CODE: {
      do: "setCaptiveState",
    },
  },
  actions: {
    clearHoveredNode(data) {
      data.hovered = undefined
    },
    setHoveredNode(data, { id }) {
      data.hovered = id
    },
    clearHintedNodes(data) {
      data.hinted = []
    },
    setHintedNodes(data, { ids }) {
      data.hinted = ids
    },
    setCurrentNode(data, { id }) {
      data.current = id
    },
    setCaptiveState(data, { code }) {
      data.code = code
      try {
        const design = Function("return " + code)()
        data.error = ""
        data.captive = createState(design)
      } catch (e) {
        data.error = e.message
      }
    },
  },
})

export default function (props: { project: string }) {
  const local = useStateDesigner(ui)
  const editor = useStateDesigner(codeEditor)

  React.useEffect(() => {
    editor.send("LOADED_CODE", player)
    local.send("CHANGED_CODE", { code: player })
  }, [])

  return (
    <Grid
      sx={{
        gridTemplateColumns: "auto 25%",
        gridTemplateRows: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        height: ["auto", "auto", "100vh"],
        width: "100vw",
        overflow: "hidden",
        bg: "#fff",
        p: 3,
        gap: 4,
        color: "#000",
        margin: [0, 0, "0 auto"],
      }}
    >
      {local.data.captive ? (
        <StateTree source={local.data.captive} />
      ) : (
        <Box>{local.data.error}</Box>
      )}
      {local.data.captive && (
        <Grid
          sx={{
            maxHeight: "100%",
            gridTemplateRows: "auto 1fr",
            color: "#fff",
            width: "100%",
            mt: 5,
            overflow: "scroll",
            position: "relative",
          }}
        >
          <Grid
            columns="1fr auto auto"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              pt: 3,
              pb: 1,
              gap: 1,
              alignItems: "center",
              width: "100%",
              background: "#FFF",
              zIndex: 888,
            }}
          >
            <Input
              color="#000"
              readOnly
              autoComplete={"off"}
              autoCapitalize={"off"}
              defaultValue={editor.data.error}
            />
            <IconButton
              title="Save Changes"
              color="#d00"
              disabled={!editor.can("SAVED")}
              onClick={() => editor.send("SAVED")}
            >
              <Save />
            </IconButton>
            <IconButton
              title="Revert Changes"
              color="#d00"
              disabled={!editor.can("CANCELLED")}
              onClick={() => editor.send("CANCELLED")}
            >
              <RefreshCcw />
            </IconButton>
          </Grid>
          <Box sx={{ overflow: "hidden", pt: "64px", pb: 3 }}>
            <CodeEditor />
          </Box>
        </Grid>
      )}
    </Grid>
  )
}

const StateTree: React.FC<{
  source: S.Design<any, any> | S.DesignedState<any, any>
}> = ({ source }) => {
  const local = useStateDesigner(ui)
  const state = useStateDesigner(local.data.captive, [local.data.captive])

  // Static, based on source
  const flatNodes = React.useMemo(() => {
    return getFlatStates(local.data.captive.stateTree)
  }, [local.data.captive])

  // Dynamic, based on state
  const events = getAllEvents(state.stateTree)

  const eventCounts = getEventCounts(events)

  const rContainer = React.useRef<HTMLDivElement>()

  function loadExample(code) {
    codeEditor.send("LOADED_CODE", code)
    ui.send("CHANGED_CODE", { code })
  }

  return (
    <Box
      ref={rContainer}
      sx={{
        color: "#000",
        fontSize: 16,
        fontWeight: 700,
        fontFamily: "monospace",
        overflow: "scroll",
      }}
    >
      <Flex
        sx={{
          position: "fixed",
          zIndex: 999,
          background: "#fff",
          top: 0,
          left: 0,
          width: "100%",
          height: "56px",
          borderBottom: "2px solid #efefef",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {state.id}
      </Flex>
      <Grid
        sx={{
          mt: "48px",
          gridTemplateColumns: ["auto", "auto", "auto 1fr auto"],
        }}
      >
        <Column>
          <ColumnHeading>States</ColumnHeading>
          <Styled.ul>
            {flatNodes.map((node, i) => (
              <Styled.li
                key={i}
                style={{
                  margin: 0,
                  marginLeft: -8,
                  padding: 0,
                  width: "100%,",
                }}
              >
                <Button
                  title={`Zoom to ${node.name}`}
                  sx={{
                    fontFamily: "monospace",
                    border: "none",
                    px: 2,
                    py: 2,
                    my: 0,
                    background: "none",
                    color: "#000",
                    fontWeight: 700,
                    width: "100%",
                    borderRadius: 4,
                    fontSize: [2, 1],
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    "& > *": { mr: 1 },
                    "&:hover": { background: "#eee", color: "#d00" },
                  }}
                  onClick={() => local.send("SELECTED_NODE", { id: node.path })}
                  onMouseEnter={() =>
                    local.send("HOVERED_ON_NODE", { id: node.path })
                  }
                  onMouseLeave={() => local.send("HOVERED_OFF_NODE")}
                >
                  {Array.from(Array(node.depth)).map((_, i) => (
                    <Circle key={i} size="4" strokeWidth={3} />
                  ))}
                  {node.isInitial ? (
                    <Disc
                      size="12"
                      strokeWidth={3}
                      opacity={node.active ? 1 : 0.5}
                    />
                  ) : (
                    <Circle
                      size="12"
                      strokeWidth={3}
                      opacity={node.active ? 1 : 0.5}
                    />
                  )}
                  {node.name}
                </Button>
              </Styled.li>
            ))}
            <hr />
            <Styled.li>
              <EventButton onClick={() => loadExample(toggle)}>
                Toggle Example
              </EventButton>
            </Styled.li>
            <Styled.li>
              <EventButton onClick={() => loadExample(counter)}>
                Counter Example
              </EventButton>
            </Styled.li>
            <Styled.li>
              <EventButton onClick={() => loadExample(player)}>
                Player Example
              </EventButton>
            </Styled.li>
          </Styled.ul>
        </Column>
        <Flex
          sx={{
            alignItems: "flex-start",
            justifyContent: "center",
            flexDirection: "column",
            margin: [0, 0, "0 auto"],
            gridColumn: ["1 / span 4", "1 / span 4", "2 / span 3"],
            borderBottom: ["2px solid #efefef", "none"],
            gridRow: 2,
            maxWidth: [null, null, "100%", "75%", "50%"],
          }}
        >
          <StateNode
            node={
              flatNodes.find((n) => n.path === ui.data.current) ||
              state.stateTree
            }
          />
          {state.data && (
            <pre>
              data ={" "}
              <Styled.code style={{ color: "#000" }}>
                {JSON.stringify(state.data, null, 2)}
              </Styled.code>
            </pre>
          )}
          {Object.values(state.values).length > 0 && (
            <pre>
              values ={" "}
              <Styled.code style={{ color: "#000" }}>
                {JSON.stringify(state.values, null, 2)}
              </Styled.code>
            </pre>
          )}
        </Flex>
        <Column>
          <ColumnHeading>Events</ColumnHeading>
          <Styled.ul>
            {Object.entries(eventCounts).map(([name, count], i) => (
              <Styled.li key={i}>
                <EventButton
                  title={`Send ${name} Event`}
                  disabled={!state.can(name)}
                  onClick={() => {
                    state.send(name, 0)
                    local.send("HOVERED_OFF_EVENT")
                  }}
                  onMouseEnter={() => {
                    const ids: string[] = []
                    for (let node of flatNodes) {
                      if (node.on[name]) {
                        ids.push(node.path)
                      }
                    }

                    local.send("HOVERED_ON_EVENT", { ids })
                  }}
                  onMouseLeave={() => local.send("HOVERED_OFF_EVENT")}
                >
                  {name}
                  {/* {count > 1 && ` x${count}`} */}
                </EventButton>
              </Styled.li>
            ))}
          </Styled.ul>
        </Column>
      </Grid>
    </Box>
  )
}

const StateNode: React.FC<{
  node: S.State<any, any>
}> = ({ node }) => {
  return (
    <Box
      sx={{
        flexGrow: [1, 1, 1, 0],
        width: ["100%", "fit-content"],
        height: "fit-content",
      }}
    >
      {node.type === "parallel" ? (
        <ParallelStateNode node={node} />
      ) : node.type === "branch" ? (
        <BranchStateNode node={node} />
      ) : (
        <LeafStateNode node={node} />
      )}
    </Box>
  )
}

const LeafStateNode: React.FC<{
  node: S.State<any, any>
}> = ({ node }) => {
  return (
    <NodeBox node={node}>
      <Flex sx={{ justifyContent: "space-between" }}>
        <Heading as={"h3"}>{node.name}</Heading>
        {node.isInitial && <InitialMarker />}
      </Flex>
      <NodeEvents node={node} />
    </NodeBox>
  )
}

const BranchStateNode: React.FC<{
  node: S.State<any, any>
}> = ({ node }) => {
  const childNodes = Object.values(node.states)

  function getSortedBranchChildNodes(nodes: S.State<any, any>[]) {
    return sortBy(
      sortBy(nodes, (n) => Object.values(n.states).length).reverse(),
      (n) => !n.isInitial
    )
  }

  return (
    <NodeBox node={node}>
      <Flex sx={{ justifyContent: "space-between" }}>
        <Heading as={"h3"} sx={{ pl: 0 }}>
          {node.name}
        </Heading>
        {node.isInitial && <InitialMarker />}
      </Flex>
      <NodeEvents node={node} />
      <Flex sx={{ flexWrap: "wrap" }}>
        {getSortedBranchChildNodes(childNodes).map((child, i) => (
          <StateNode key={i} node={child} />
        ))}
      </Flex>
    </NodeBox>
  )
}

const ParallelStateNode: React.FC<{
  node: S.State<any, any>
}> = ({ node }) => {
  const childNodes = Object.values(node.states)

  function getSortedParallelChildNodes(nodes: S.State<any, any>[]) {
    return sortBy(nodes, (n) => Object.entries(n.states).length)
  }

  return (
    <NodeBox sx={{ p: 0 }} node={node}>
      <Box
        sx={{
          borderBottom: `2px solid ${node.active ? "#000" : "#ddd"}`,
          p: 2,
        }}
      >
        <Flex sx={{ justifyContent: "space-between" }}>
          <Heading as={"h3"} sx={{ pl: 1 }}>
            {node.name}
          </Heading>
          {node.isInitial && <InitialMarker />}
        </Flex>
        <NodeEvents node={node} pl={16} />
      </Box>
      <Grid
        sx={{
          gridTemplateColumns: `repeat(${childNodes.length}, auto min-content)`,
          gridAutoRows: "100%",
          gap: 0,
          gridAutoFlow: "column",
          overflow: "hidden",
          position: "relative",
          height: "100%",
        }}
      >
        {getSortedParallelChildNodes(childNodes).map((child, i) => {
          return (
            <React.Fragment key={i}>
              <ParallelChildBranchNode node={child} />
              {i < childNodes.length - 1 && (
                <ParallelDivider isActive={node.active} />
              )}
            </React.Fragment>
          )
        })}
      </Grid>
    </NodeBox>
  )
}

const ParallelChildBranchNode: React.FC<{
  node: S.State<any, any>
}> = ({ node }) => {
  const childNodes = Object.values(node.states)

  function getSortedParallelChildNodes(nodes: S.State<any, any>[]) {
    return sortBy(nodes, (n) => Object.values(n.states).length).reverse()
  }

  return (
    <GhostNodeBox
      node={node}
      sx={{
        minHeight: [null, 76],
        minWidth: 64,
        p: 2,
      }}
    >
      <Heading
        sx={{
          pl: node.type === "leaf" ? 1 : 2,
          pt: 1,
        }}
        as={"h3"}
      >
        {node.name}
      </Heading>
      <NodeEvents node={node} pl={16} />
      <Flex sx={{ flexWrap: "wrap" }}>
        {getSortedParallelChildNodes(childNodes).map((child) => (
          <StateNode key={child.path} node={child} />
        ))}
      </Flex>
    </GhostNodeBox>
  )
}

const NodeBox = React.forwardRef<
  HTMLDivElement,
  {
    node: S.State<any, any>
  } & BoxProps
>(({ node, ...rest }, ref) => {
  const local = useStateDesigner(ui)
  const isHinted = local.data.hinted.includes(node.path)
  const isHovered = local.data.hovered === node.path

  return (
    <Box
      {...rest}
      ref={ref}
      sx={{
        bg: "#fff",
        border: `2px solid ${
          node.active && isHinted
            ? "#d00"
            : isHinted
            ? "#fbb"
            : node.active
            ? "#000"
            : "#ddd"
        }`,
        color: isHovered ? "#d00" : "#000",
        borderRadius: 12,
        padding: 2,
        m: 2,
        fontSize: 1,
        fontFamily: "monospace",
        overflow: "hidden",
        minHeight: [null, 64, 64, 120],
        minWidth: 96,
        ...rest.sx,
      }}
    />
  )
})

const GhostNodeBox = React.forwardRef<
  HTMLDivElement,
  {
    node: S.State<any, any>
  } & BoxProps
>(({ node, ...rest }, ref) => {
  const local = useStateDesigner(ui)
  const isHinted = local.data.hinted.includes(node.path)
  const isHovered = local.data.hovered === node.path
  return (
    <Box
      ref={ref}
      {...rest}
      sx={{
        color: isHovered ? "#d00" : "#000",
        fontSize: 1,
        fontFamily: "monospace",
        ...rest.sx,
      }}
    />
  )
})

const NodeEvents: React.FC<{
  node: S.State<any, any>
  pl?: number
}> = ({ node, pl = 0 }) => {
  const handlers = [
    ...Object.entries(node.on),
    node.onEnter && ["onEnter"],
    node.onExit && ["onExit"],
    node.onEvent && ["onEvent"],
    node.repeat && ["repeat"],
    node.async && ["async"],
  ].filter(Boolean)

  return (
    <Styled.ul style={{ paddingLeft: pl, paddingTop: 4 }}>
      {/* {handlers.map(([event, handler], i) => (
        <Styled.li key={i}>{event}</Styled.li>
      ))} */}
    </Styled.ul>
  )
}

const ParallelDivider: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <Box
      sx={{
        alignSelf: "stretch",
        height: "100%",
        borderLeft: `2px dashed ${isActive ? "#000" : "#ddd"}`,
      }}
    />
  )
}

const InitialMarker: React.FC = () => {
  return <Disc strokeWidth={3} size={16} style={{ marginLeft: 4 }} />
}

const EventButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      sx={{
        width: "100%",
        textAlign: "left",
        fontFamily: "monospace",
        border: "2px solid #000",
        background: "none",
        color: "#000",
        fontWeight: 700,
        borderRadius: 8,
        fontSize: [2, 1],
        "&:disabled": {
          border: "2px solid #ddd",
          cursor: "default",
        },
      }}
      {...props}
    />
  )
}

const ColumnHeading: React.FC = (props) => {
  return (
    <Heading
      as={"h4"}
      sx={{
        position: "sticky",
        top: "32px",
        py: 2,
        mb: 1,
        left: 0,
        background: "#FFF",
        zIndex: 888,
      }}
      {...props}
    />
  )
}

const Column: React.FC = (props) => {
  return <Box sx={{ width: "fit-content", gridRow: [3, 3, 2] }} {...props} />
}

/* --------------------- Helpers -------------------- */

function getOffsetFrame(
  el: HTMLElement
): {
  x: number
  y: number
  maxX: number
  maxY: number
  midX: number
  midY: number
  width: number
  height: number
} {
  const rect = el.getBoundingClientRect()
  var position = {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    midX: rect.left + rect.width / 2 + window.scrollX,
    midY: rect.top + rect.height / 2 + window.scrollX,
    maxX: rect.left + rect.width + window.scrollY,
    maxY: rect.top + rect.height + window.scrollY,
    width: rect.width,
    height: rect.height,
  }
  return position
}

function getEvents(state: S.State<any, any>): string[][] {
  const localEvents: string[][] = []

  if (state.active) {
    localEvents.push(...Object.keys(state.on).map((k) => [state.name, k]))
  }

  for (let child of Object.values(state.states)) {
    localEvents.push(...getEvents(child))
  }

  return localEvents
}

function getFlatStates(state: S.State<any, any>): S.State<any, any>[] {
  return [state].concat(...Object.values(state.states).map(getFlatStates))
}

function getAllEvents(state: S.State<any, any>): string[][] {
  const localEvents: string[][] = []

  localEvents.push(...Object.keys(state.on).map((k) => [state.name, k]))

  for (let child of Object.values(state.states)) {
    localEvents.push(...getAllEvents(child))
  }

  return localEvents
}

function getEventCounts(events: string[][]): Record<string, number> {
  const dict: Record<string, number> = {}

  for (let [_, event] of events) {
    const prior = dict[event]
    if (prior === undefined) {
      dict[event] = 1
    } else {
      dict[event]++
    }
  }

  return dict
}
