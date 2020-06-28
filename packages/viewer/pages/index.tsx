import { useRouter } from "next/router"
import Link from "next/link"
import { useUser } from "../auth/useUser"
import { Flex, Button, Styled, Text, Heading } from "theme-ui"

const Index = () => {
  const { user, logout } = useUser()
  const router = useRouter()

  if (user) {
    router.push("/user")
  }

  return (
    <Flex variant="fullView" sx={{ fontSize: 16 }}>
      <Heading>State Designer</Heading>
      <Text sx={{ mb: 5 }}>Design Environment</Text>
      {user ? (
        <Text>Logging In...</Text>
      ) : (
        <Button sx={{ minWidth: 200 }}>
          <Link href={"/auth"}>
            <Styled.a>Sign in</Styled.a>
          </Link>
        </Button>
      )}
    </Flex>
  )
}

export default Index
