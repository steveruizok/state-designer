import * as React from "react"
import { useUser } from "../../../../auth/useUser"
import Link from "next/link"
import IconSelect from "./icon-select"
import { Sun, Moon, User } from "react-feather"
import {
  Flex,
  IconButton,
  Label,
  Checkbox,
  Button,
  Heading,
  useColorMode,
} from "theme-ui"

const Controls: React.FC = ({}) => {
  const { user, logout } = useUser()
  const [colorMode, setColorMode] = useColorMode()

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
      <IconButton
        onClick={() =>
          setColorMode(colorMode === "default" ? "dark" : "default")
        }
      >
        {colorMode === "dark" ? <Moon /> : <Sun />}
      </IconButton>
      <IconSelect
        title={"Account"}
        icon={<User />}
        options={{
          "Sign In": () => console.log("signing in"),
          "Sign Out": () => logout(),
        }}
      />
    </Flex>
  )
}

export default Controls
