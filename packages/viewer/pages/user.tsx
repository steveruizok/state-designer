import useSWR from "swr"
import Link from "next/link"
import { useRouter } from "next/router"
import { useUser } from "../auth/useUser"
import LoadingScreen from "../components/site/loading-screen"
import { Styled, Heading, Flex, Button, Box } from "theme-ui"

const deadFetcher = () => {
  return undefined
}

const fetcher = (url: string, token: string) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({ "Content-Type": "application/json", token }),
    credentials: "same-origin",
  }).then((res) => res.json())

const Index = () => {
  const { user, logout } = useUser()

  const { data } = useSWR(
    [`/api/${user?.id}`, user?.token],
    user ? fetcher : deadFetcher
  )

  if (!data) {
    return <LoadingScreen>Getting Projects...</LoadingScreen>
  }

  if (!data.isAuthenticated) {
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

  return (
    <Flex variant="fullView">
      <Heading as="h1" sx={{ mb: 3 }}>
        Logged In
      </Heading>
      <Heading as="h3">{user.email}</Heading>
      <Styled.hr />
      <Heading as="h3">Projects</Heading>
      <Box sx={{ my: 5 }}>
        <Styled.ul>
          {data.projects.map((pid, i) => (
            <li key={i}>
              <Link href={`/${user.id}/${pid}`}>{pid}</Link>
            </li>
          ))}
        </Styled.ul>
      </Box>
      <Styled.hr />
      <Button onClick={() => logout()}>Log Out</Button>
    </Flex>
  )
}

export default Index
