import * as React from "react"
import { Button, Styled, Link, Box } from "theme-ui"
import { S, useStateDesigner } from "@state-designer/react"
import { Project } from "../../states/index"
import { Highlights } from "../../states/highlights"

const NodeEvents: React.FC<{ node: S.State<any, any> }> = ({ node }) => {
  const local = useStateDesigner(Project)
  const events = Object.entries(node.on)
  const captiveData = local.data.captive.data

  return (
    <Box
      sx={{
        py: 0,
        px: 1,
        "& ul": {
          display: "flex",
        },
        "& > ul > li": {
          mr: 1,
        },
      }}
    >
      <Styled.ul>
        {events.map(([name, handlers], i) => {
          const payloadStringValue = local.data.code.payloads[name]

          let payload: any

          if (!!payloadStringValue) {
            try {
              const fn = Function("Static", `return ${payloadStringValue}`)
              payload = fn(local.data.statics)
            } catch (e) {
              // suppress
            }
          }

          const isActive = node.active
          const canHandleEvent = local.data.captive.can(name, payload)
          const isDisabled = !isActive || !canHandleEvent

          let targets: string[] = []

          for (let handler of handlers) {
            if (handler.to.length > 0) {
              for (let transition of handler.to) {
                targets.push(transition(captiveData, payload, undefined))
              }
            }
          }

          return (
            <EventButton
              key={i}
              name={name}
              node={node}
              payload={payload}
              targets={targets}
              isDisabled={isDisabled}
              isActive={isActive}
            />
          )
        })}
      </Styled.ul>
    </Box>
  )
}
export default NodeEvents

const EventButton: React.FC<{
  name: string
  node: S.State<any, any>
  payload: any
  targets: any
  isDisabled: boolean
  isActive: boolean
}> = ({ name, node, payload, targets, isDisabled, isActive }) => {
  const rButton = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    Highlights.send("MOUNTED_EVENT_BUTTON", {
      name,
      ref: rButton,
      path: node.path,
    })
  })

  return (
    <Styled.li>
      <Button
        ref={rButton}
        title={
          !isDisabled
            ? `Send ${name} event`
            : !isActive
            ? "Cannot send events when state is inactive."
            : "The state cannot handle this event due to its current payload."
        }
        variant={"nodeEvent"}
        sx={{ fontSize: 1 }}
        disabled={isDisabled}
        onClick={() => Project.data.captive.send(name)}
      >
        {name}
      </Button>
    </Styled.li>
  )
}
