import useSWR from "swr"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useUser } from "../auth/useUser"
import LoadingScreen from "../components/site/loading-screen"
import { createNewProject } from "../utils/firebase"
import { Styled, Text, Grid, Input, Heading, Flex, Button, Box } from "theme-ui"

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

  const [newProjectName, setNewProjectName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const { data } = useSWR(
    [`/api/${user?.id}`, user?.token],
    user ? fetcher : deadFetcher
  )

  if (!data) {
    return <LoadingScreen>Getting Projects...</LoadingScreen>
  }

  if (!data.isAuthenticated) {
    return (
      <Flex variant="fullView" sx={{ fontSize: 16 }}>
        <Heading>State Designer</Heading>
        <Text>Design Environment</Text>
        <Button sx={{ m: 5, minWidth: 200 }}>
          <Link href={"/auth"}>
            <Styled.a>Sign in</Styled.a>
          </Link>
        </Button>
      </Flex>
    )
  }

  return (
    <Flex variant="fullView">
      <Box
        sx={{
          py: 4,
          overflowY: "scroll",
          textAlign: "left",
          width: 320,
        }}
      >
        <Heading as="h1" sx={{ mb: 3 }}>
          State Designer
        </Heading>
        <Styled.p>
          Welcome to a <i>very</i> early build of the <b>State Designer</b>{" "}
          design environment. You can create and share projects and copy other
          user's projects. Lots more to come.
        </Styled.p>
        <Styled.p>
          Learn more at:{" "}
          <Styled.a href="https://state-designer.com">
            state-designer.com
          </Styled.a>
          .
        </Styled.p>
        <Styled.p>
          Follow me for updates:{" "}
          <Styled.a href="https://twitter.com/steveruizok">
            @steveruizok
          </Styled.a>
          .
        </Styled.p>
        <Styled.hr />
        <Heading as="h3">Projects</Heading>
        <Box sx={{ mb: 4, mt: 3, fontSize: 3 }}>
          <Styled.ul>
            {data.projects.map((pid, i) => (
              <li key={i}>
                <Link href={`/${user.id}/${pid}`}>
                  <Styled.a>{pid}</Styled.a>
                </Link>
              </li>
            ))}
          </Styled.ul>
        </Box>
        <Grid
          sx={{
            gridTemplateColumns: "1fr",
            gridAutoFlow: "row",
          }}
        >
          <Input
            value={newProjectName}
            placeholder="Enter a Project ID"
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Button
            disabled={newProjectName === "" || isLoading}
            onClick={() => {
              setIsLoading(true)
              createNewProject(newProjectName, user.id, user.id)
            }}
          >
            {isLoading ? "Creating Project..." : "Create New Project"}
          </Button>
        </Grid>
        <Styled.hr />
        <Text sx={{ fontSize: 1, my: 2, textAlign: "center" }}>
          Signed in as {user.email}
        </Text>
        <Button onClick={() => logout()} sx={{ width: "100%" }}>
          Log Out
        </Button>
      </Box>
    </Flex>
  )
}

export default Index
