import React from "react"
import { Box, Heading, Button } from "rebass"
import { Label, Input } from "@rebass/forms"
import { useStateDesigner } from "state-designer"
import { NamedFunctionStateDesigner } from "./namedFunction"
import { namedFunctionList } from "./namedFunctionList"
import { AnimatePresence, motion } from "framer-motion"

export interface Props {}

const Designer: React.FC<Props> = ({ children }) => {
  const { data, send } = useStateDesigner(namedFunctionList)

  return (
    <Box p={2}>
      <NamedFunctionList />
    </Box>
  )
}

export default Designer

const NamedFunctionList: React.FC<{}> = ({ children }) => {
  const { data, send } = useStateDesigner(namedFunctionList)

  return (
    <Box p={2}>
      <Heading>Named Functions</Heading>
      <Button onClick={() => send("CREATE_ITEM")}>Add Action</Button>
      <ul>
        <AnimatePresence>
          {data.items.map((item, index) => {
            return (
              <motion.div
                positionTransition={{ duration: 0.2 }}
                key={item.id}
                exit={{ opacity: 0 }}
              >
                <NamedFunction
                  key={item.id}
                  state={item.item}
                  canMoveUp={index > 0 && data.items.length > 1}
                  onMoveUp={() => send("MOVE_ITEM", { id: item.id, delta: -1 })}
                  canMoveDown={index < data.items.length - 1}
                  onMoveDown={() =>
                    send("MOVE_ITEM", { id: item.id, delta: 1 })
                  }
                >
                  ...
                </NamedFunction>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </ul>
    </Box>
  )
}

const NamedFunction: React.FC<{
  state: NamedFunctionStateDesigner
  onMoveUp: any
  onMoveDown: any
  canMoveUp: boolean
  canMoveDown: boolean
}> = ({
  state,
  onMoveDown = () => {},
  onMoveUp = () => {},
  canMoveDown,
  canMoveUp
}) => {
  const { data, send } = useStateDesigner(state)
  const { id, editing, dirty, clean } = data

  return (
    <Box p={1} as="li" sx={{ border: "1px solid #ccc", borderRadius: 8 }}>
      {/* <form> */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "min-content 1fr",
          columnGap: 2,
          rowGap: 2,
          alignItems: "center"
        }}
      >
        {editing ? (
          <>
            <Label htmlFor="namedFuctionName">Name</Label>
            <Input
              name="namedFuctionName"
              type="text"
              value={dirty.name}
              onChange={(e: any) => send("UPDATE_NAME", e.target.value)}
            />
            <Label htmlFor="namedFunctionCode">Code</Label>
            <Input
              name="namedFunctionCode"
              type="text"
              value={dirty.code}
              onChange={(e: any) => send("UPDATE_CODE", e.target.value)}
            />
            <Box
              sx={{
                display: "grid",
                gridColumn: "span 2",
                gridAutoFlow: "column",
                gap: 1
              }}
            >
              <Button onClick={() => send("CANCEL")}>Cancel</Button>
              <Button onClick={() => send("SAVE")}>Save</Button>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridColumn: "span 2",
              gridAutoFlow: "column",
              gap: 1
            }}
          >
            <Input
              name="namedFuctionName"
              type="text"
              value={clean.name}
              disabled={true}
            />
            <Button onClick={() => send("EDIT")}>Edit</Button>
            <button disabled={!canMoveDown} onClick={onMoveDown}>
              ▼
            </button>
            <button disabled={!canMoveUp} onClick={onMoveUp}>
              ▲
            </button>
          </Box>
        )}
      </Box>
      {/* </form> */}
    </Box>
  )
}
