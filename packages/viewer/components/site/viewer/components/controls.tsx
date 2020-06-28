// @jsx jsx
import * as React from "react"
import { useUser } from "../../../../auth/useUser"
import { forkProject } from "../../../../utils/firebase"
import { ui } from "../states/ui"
import { Sun, Moon, Copy } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import {
  Flex,
  IconButton,
  jsx,
  Checkbox,
  Button,
  Heading,
  useColorMode,
} from "theme-ui"

const Controls: React.FC = ({}) => {
  const { user, logout } = useUser()
  const [colorMode, setColorMode] = useColorMode()
  const local = useStateDesigner(ui)

  return (
    <Flex
      sx={{
        gridArea: "controls",
        alignItems: "center",
        justifyContent: "flex-end",
        borderBottom: "outline",
        borderColor: "border",
      }}
    >
      {local.data.isOwner ? (
        <IconButton
          title="Copy This Project"
          onClick={() => {
            const { pid, oid, uid } = local.data
            forkProject(pid, oid, uid, pid + "_copy")
          }}
        >
          <Copy />
        </IconButton>
      ) : (
        <Button
          title="Copy This Project"
          onClick={() => {
            const { pid, oid, uid } = local.data
            forkProject(pid, oid, uid)
          }}
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            color: "accent",
          }}
        >
          Copy this Project <Copy size={14} strokeWidth={3} sx={{ ml: 2 }} />
        </Button>
      )}
      <IconButton
        title="Change Color Mode"
        onClick={() =>
          setColorMode(colorMode === "default" ? "dark" : "default")
        }
        sx={{ ml: 2 }}
      >
        {colorMode === "dark" ? <Moon /> : <Sun />}
      </IconButton>
    </Flex>
  )
}

export default Controls
