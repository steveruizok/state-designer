import { useRouter } from "next/router"
import Link from "next/link"
import { useUser } from "../auth/useUser"
import { Flex } from "theme-ui"

const Index = () => {
  const { user, logout } = useUser()
  const router = useRouter()

  if (user) {
    router.push("/user")
  }

  if (!user) {
    return (
      <Flex variant="fullView">
        <p>Hi there!</p>
        <p>
          You are not signed in.{" "}
          <Link href={"/auth"}>
            <a>Sign in</a>
          </Link>
        </p>
      </Flex>
    )
  }

  return <div>Logging in...</div>
}

export default Index
