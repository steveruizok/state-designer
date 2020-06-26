import * as React from "react"
import { useUser } from "../../../../auth/useUser"
import { Flex, IconButton } from "theme-ui"
import { Home } from "react-feather"
import { useRouter } from "next/router"

const Menu: React.FC = ({}) => {
  const { user, logout } = useUser()
  const router = useRouter()

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
    </Flex>
  )
}

export default Menu
