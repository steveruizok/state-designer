import * as React from "react"
import { useUser } from "../../../../auth/useUser"
import { Flex, IconButton } from "theme-ui"
import { Menu as MenuIcon } from "react-feather"

const Menu: React.FC = ({}) => {
  const { user, logout } = useUser()

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
      <IconButton>
        <MenuIcon />
      </IconButton>
    </Flex>
  )
}

export default Menu
