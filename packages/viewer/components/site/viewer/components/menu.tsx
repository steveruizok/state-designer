import * as React from "react"
import { useUser } from "../../../../auth/useUser"
import { Flex, IconButton } from "theme-ui"
import { Home } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import {
  isProjectNameValid,
  updateProjectName,
} from "../../../../utils/firebase"
import { useRouter } from "next/router"
import { Project } from "../states"
import ValueInput from "./value-input"

const Menu: React.FC = ({}) => {
  const router = useRouter()
  const local = useStateDesigner(Project)

  return (
    <Flex
      sx={{
        gridArea: "menu",
        alignItems: "center",
        justifyContent: "flex-start",
        borderBottom: "outline",
        borderColor: "border",
      }}
    >
      <IconButton onClick={() => router.push("/user")}>
        <Home />
      </IconButton>
      <ValueInput
        value={local.data.pid}
        transform={(v) => v}
        validate={(value) =>
          isProjectNameValid(local.data.pid, local.data.uid, value)
        }
        onChange={(value) =>
          updateProjectName(local.data.pid, local.data.uid, value)
        }
      />
    </Flex>
  )
}

export default Menu
