import { useRouter } from "next/router"
import Link from "next/link"
import { useUser } from "../auth/useUser"
import { Flex, Text, Heading } from "theme-ui"

const Index = () => {
  const { user, logout } = useUser()
  const router = useRouter()

  if (user) {
    router.push("/user")
  }

  if (!user) {
    return (
      <Flex variant="fullView" sx={{ fontSize: 16 }}>
        <Heading>State Designer</Heading>
        <Text>Design Environment</Text>
        <p>
          <Link href={"/auth"}>
            <a>Sign in / Sign Up</a>
          </Link>
        </p>
      </Flex>
    )
  }

  return <div>Logging in...</div>
}

export default Index
