import * as React from "react"
import { sortBy } from "lodash"
import {
  Styled,
  Divider,
  Button,
  Grid,
  BoxProps,
  Box,
  Flex,
  Heading,
} from "theme-ui"
import { Disc, Circle } from "react-feather"
import { S, createState, useStateDesigner } from "@state-designer/react"

type Dimension = {
  bottom: number
  height: number
  left: number
  right: number
  top: number
  width: number
  x: number
  y: number
}

/*
  Only one "layer" of depth at a time?
  Events, transitions, etc should only be shown on the current depth layer.
*/

type Transition = {
  event: string
  from: Node
  to: Node
}

class Node {
  state: S.State<any, any>
  id: string
  initial: boolean
  path: string
  type: string
  depth: number
  width = 0
  height = 0
  highlight = false
  parent: Node | null
  children: Node[]
  ref = React.createRef<HTMLDivElement>()
  dimension: Dimension = {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  }

  constructor(
    state: S.State<any, any>,
    parent: Node | null,
    depth: number,
    initial: boolean
  ) {
    this.state = state
    this.id = state.name
    this.path = state.path
    this.depth = depth
    this.parent = parent
    this.type = state.type
    this.initial = initial
    this.children = Object.values(state.states).map(
      (child) =>
        new Node(child, this, this.depth + 1, child.name === state.initial)
    )

    // Apply sizes

    if (this.parent !== null) {
      this.parent.height++
    }

    this.width += this.children.length
  }
}

export default function () {
  return (
    <Box
      sx={{
        bg: "#fff",
        p: 3,
        margin: [0, "0 auto"],
      }}
    >
      <StateTree source={toggle} />
      <Divider />
      <StateTree source={playerState} />
    </Box>
  )
}

const StateTree: React.FC<{
  source: S.Design<any, any> | S.DesignedState<any, any>
}> = ({ source }) => {
  const state = useStateDesigner(source)
  const local = useStateDesigner({
    data: {
      selected: state.stateTree,
      highlight: [],
    },
  })

  // Dynamic, based on state
  const events = getAllEvents(state.stateTree)

  const eventCounts = getEventCounts(events)

  const [highlight, setHighlight] = React.useState<Node[]>([])

  const root = React.useMemo(() => new Node(state.stateTree, null, 0, true), [])

  // Viewer UI
  const [current, setCurrent] = React.useState(root)

  // Static, based on source
  const flatNodes = React.useMemo(() => {
    return getFlatNodes(current)
  }, [current])

  const rContainer = React.useRef<HTMLDivElement>()

  flatNodes.forEach((node) => {
    return (node.highlight = highlight.includes(node))
  })

  return (
    <Box
      ref={rContainer}
      sx={{
        color: "#000",
        fontSize: 16,
        fontWeight: 700,
        fontFamily: "monospace",
      }}
    >
      <Grid sx={{ gridTemplateColumns: ["auto", "auto 1fr 1fr auto"] }}>
        <Flex
          sx={{
            gridRow: 1,
            gridColumn: "1 / span 5",
            borderBottom: "2px solid #efefef",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {state.id}
        </Flex>
        <Box sx={{ width: "fit-content", gridRow: [3, 2] }}>
          <Heading as={"h4"}>States</Heading>
          <Styled.ul>
            {getFlatNodes(root).map((node, i) => (
              <Styled.li
                key={i}
                style={{
                  margin: 0,
                  padding: 0,
                }}
              >
                <Button
                  sx={{
                    fontFamily: "monospace",
                    border: "none",
                    px: 2,
                    py: 2,
                    mx: -2,
                    my: 0,
                    background: "none",
                    color: "#000",
                    fontWeight: 700,
                    borderRadius: 4,
                    fontSize: [2, 1],
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    "& > *": { mr: 1 },
                    "&:hover": { background: "#eee" },
                  }}
                  onClick={() => setCurrent(node)}
                  onMouseEnter={() => setHighlight([node])}
                  onMouseLeave={() => setHighlight([])}
                >
                  {Array.from(Array(node.depth)).map((_, i) => (
                    <Circle key={i} size="4" strokeWidth={3} />
                  ))}
                  {node.initial ? (
                    <Disc
                      size="12"
                      strokeWidth={3}
                      stroke={node.state.active ? "#000" : "#aaa"}
                    />
                  ) : (
                    <Circle
                      size="12"
                      strokeWidth={3}
                      stroke={node.state.active ? "#000" : "#aaa"}
                    />
                  )}
                  {node.id}
                </Button>
              </Styled.li>
            ))}
          </Styled.ul>
        </Box>
        <Flex
          sx={{
            alignItems: "flex-start",
            justifyContent: "center",
            flexDirection: "column",
            margin: [0, "0 auto"],
            gridColumn: ["1 / span 4", "2 / span 3"],
            borderBottom: ["2px solid #efefef", "none"],
            gridRow: 2,
            maxWidth: [null, null, "80%", "62%", "50%"],
          }}
        >
          <StateNode node={current} />
          <pre>
            <Styled.code style={{ color: "#000" }}>
              {JSON.stringify(state.data, null, 2)}
            </Styled.code>
          </pre>
        </Flex>
        <Box sx={{ width: "fit-content", gridRow: [3, 2] }}>
          <Heading as={"h4"}>Events</Heading>
          <Styled.ul>
            {Object.entries(eventCounts).map(([name, count], i) => (
              <Styled.li>
                <Button
                  key={i}
                  sx={{
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
                  disabled={!state.can(name)}
                  onClick={() => {
                    state.send(name)
                    setHighlight([])
                  }}
                  onMouseEnter={() => {
                    const nodes: Node[] = []
                    for (let node of flatNodes) {
                      if (node.state.on[name]) {
                        nodes.push(node)
                      }
                    }

                    setHighlight(nodes)
                  }}
                  onMouseLeave={() => setHighlight([])}
                >
                  {name}
                  {/* {count > 1 && ` x${count}`} */}
                </Button>
              </Styled.li>
            ))}
          </Styled.ul>
        </Box>
      </Grid>
    </Box>
  )
}

const StateNode: React.FC<{
  node: Node
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
  node: Node
}> = ({ node }) => {
  return (
    <NodeBox isActive={node.state.active} isHighlit={node.highlight}>
      <Flex sx={{ justifyContent: "space-between" }}>
        <Heading as={"h3"}>{node.id}</Heading>
        {node.initial && <InitialMarker />}
      </Flex>
      <NodeEvents node={node} />
    </NodeBox>
  )
}

const BranchStateNode: React.FC<{
  node: Node
}> = ({ node }) => {
  function getSortedBranchChildNodes(nodes: Node[]) {
    return sortBy(
      sortBy(nodes, (n) => n.children.length).reverse(),
      (n) => !n.initial
    )
  }

  return (
    <NodeBox isActive={node.state.active} isHighlit={node.highlight}>
      <Flex sx={{ justifyContent: "space-between" }}>
        <Heading as={"h3"} sx={{ pl: 0 }}>
          {node.id}
        </Heading>
        {node.initial && <InitialMarker />}
      </Flex>
      <NodeEvents node={node} />
      <Flex sx={{ flexWrap: "wrap" }}>
        {getSortedBranchChildNodes(node.children).map((child, i) => (
          <StateNode key={i} node={child} />
        ))}
      </Flex>
    </NodeBox>
  )
}

const ParallelStateNode: React.FC<{
  node: Node
}> = ({ node }) => {
  function getSortedParallelChildNodes(nodes: Node[]) {
    return sortBy(nodes, (n) => n.children.length)
  }

  return (
    <NodeBox
      sx={{ p: 0 }}
      isActive={node.state.active}
      isHighlit={node.highlight}
    >
      <Box
        sx={{
          borderBottom: `2px solid ${node.state.active ? "#000" : "#ddd"}`,
          p: 2,
        }}
      >
        <Flex sx={{ justifyContent: "space-between" }}>
          <Heading as={"h3"} sx={{ pl: 1 }}>
            {node.id}
          </Heading>
          {node.initial && <InitialMarker />}
        </Flex>
        <NodeEvents node={node} pl={16} />
      </Box>
      <Grid
        sx={{
          gridTemplateColumns: `repeat(${node.children.length}, auto min-content)`,
          gridAutoRows: "100%",
          gap: 0,
          gridAutoFlow: "column",
          overflow: "hidden",
          position: "relative",
          height: "100%",
        }}
      >
        {getSortedParallelChildNodes(node.children).map((child, i) => {
          return (
            <React.Fragment key={i}>
              <ParallelChildBranchNode node={child} />
              {i < node.children.length - 1 && (
                <ParallelDivider isActive={node.state.active} />
              )}
            </React.Fragment>
          )
        })}
      </Grid>
    </NodeBox>
  )
}

const ParallelChildBranchNode: React.FC<{
  node: Node
}> = ({ node }) => {
  function getSortedParallelChildNodes(nodes: Node[]) {
    return sortBy(nodes, (n) => n.children.length).reverse()
  }

  return (
    <GhostNodeBox
      ref={node.ref}
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
        {node.id}
      </Heading>
      <NodeEvents node={node} pl={16} />
      <Flex sx={{ flexWrap: "wrap" }}>
        {getSortedParallelChildNodes(node.children).map((child) => (
          <StateNode key={child.id} node={child} />
        ))}
      </Flex>
    </GhostNodeBox>
  )
}

const NodeBox = React.forwardRef<
  HTMLDivElement,
  { isActive: boolean; isHighlit: boolean } & BoxProps
>((props, ref) => (
  <Box
    {...props}
    ref={ref}
    sx={{
      bg: "#fff",
      border: `2px solid ${
        props.isActive && props.isHighlit
          ? "#d00"
          : props.isHighlit
          ? "#fbb"
          : props.isActive
          ? "#000"
          : "#ddd"
      }`,
      borderRadius: 12,
      padding: 2,
      m: 2,
      color: "#000",
      fontSize: 1,
      fontFamily: "monospace",
      overflow: "hidden",
      minHeight: [null, 120],
      minWidth: 96,
      ...props.sx,
    }}
  />
))

const GhostNodeBox = React.forwardRef<HTMLDivElement, BoxProps>(
  (props, ref) => {
    return (
      <Box
        ref={ref}
        {...props}
        sx={{
          color: "#000",
          fontSize: 1,
          fontFamily: "monospace",
          ...props.sx,
        }}
      />
    )
  }
)

const NodeEvents: React.FC<{
  node: Node
  pl?: number
}> = ({ node, pl = 0 }) => {
  const handlers = [
    ...Object.entries(node.state.on),
    node.state.onEnter && ["onEnter"],
    node.state.onExit && ["onExit"],
    node.state.onEvent && ["onEvent"],
    node.state.repeat && ["repeat"],
    node.state.async && ["async"],
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

/* --------------------- States --------------------- */

const playerState = createState({
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
                STARTED_SCRUBBING: { to: "scrubbing" },
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
            STARTED_SCRUBBING: { to: "paused" },
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
            STARTED_SCRUBBING: { to: "paused" },
          },
        },
      },
    },
  },
  on: {
    STARTED_SCRUBBING: "setProgress",
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
})

const toggle = createState({
  initial: "toggledOff",
  states: {
    toggledOff: {
      on: { TOGGLED: { to: "toggledOn" } },
    },
    toggledOn: {
      on: { TOGGLED: { to: "toggledOff" } },
      initial: "a",
      states: {
        a: {},
        b: {},
      },
    },
    p: {
      states: {
        a: {},
        b: {},
      },
    },
  },
})

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
function getFlatNodes(node: Node): Node[] {
  return [node].concat(...node.children.map(getFlatNodes))
}

function getTransitionsNodes(root: Node, data: any) {
  const nodes = [...getFlatNodes(root)]

  const transitions = getFlatNodes(root).map((node) => {
    if (node.state.on) {
      Object.entries(node.state.on).map(([event, handlers]) => {
        return handlers.map((handler) => {
          if (handler.to) {
            for (let target of handler.to) {
              let path = target(data, undefined, undefined)

              const isPreviousTransition = path.endsWith(".previous")
              const isRestoreTransition = path.endsWith(".restore")

              if (isPreviousTransition) {
                path = path.slice(0, path.length - 9)
              } else if (isRestoreTransition) {
                path = path.slice(0, path.length - 8)
              }

              let safePath = path.startsWith(".") ? path : "." + path

              const from = node
              const to = nodes.find((n) => n.path.endsWith(safePath))

              return {
                from,
                to,
                event,
              }
            }
          }
        })
      })
    }
  })
}

function getAllEvents(state: S.State<any, any>): string[][] {
  const localEvents: string[][] = []

  localEvents.push(...Object.keys(state.on).map((k) => [state.name, k]))

  for (let child of Object.values(state.states)) {
    localEvents.push(...getAllEvents(child))
  }

  return localEvents
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
