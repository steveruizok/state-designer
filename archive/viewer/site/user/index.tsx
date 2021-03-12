// @jsx jsx
import * as React from "react"
import { Sun, Moon, Twitter } from "react-feather"
import Layout from "./layout"
import Link from "next/link"
import { useRouter } from "next/router"
import exampleLinks from "../static/example-links"
import { useUser } from "../../auth/useUser"
import {
  UserProjectsResponse,
  createNewProject,
  logout,
} from "../../utils/firebase"
import { useStateDesigner } from "@state-designer/react"
import { Project } from "../app/states/index"
import {
  jsx,
  Styled,
  Text,
  Grid,
  Input,
  Heading,
  Flex,
  Button,
  Box,
  IconButton,
  useColorMode,
} from "theme-ui"

const User: React.FC<{ user: any; data: UserProjectsResponse }> = ({
  user,
  data,
}) => {
  const router = useRouter()

  React.useEffect(() => {
    Project.send("CLOSED_PROJECT")
  }, [])

  React.useEffect(() => {
    if (data && !data.isAuthenticated) {
      console.log("Not authenticated, but maybe still a user?", user)
      router.push("/auth")
    }
  }, [data])

  return (
    <Layout>
      <Title />
      <PageLayout>
        <Sidebar user={user} />
        <Content data={data} />
      </PageLayout>
    </Layout>
  )
}

const Title: React.FC = () => {
  return (
    <Grid
      sx={{
        gridArea: "title",
        alignItems: "center",
        justifyContent: "flex-end",
        textAlign: "center",
        borderBottom: "outline",
        borderColor: "border",
      }}
    >
      <Controls />
    </Grid>
  )
}

const Sidebar: React.FC<{ user: any }> = ({ user }) => {
  if (!user) {
    return <Loading />
  }

  return (
    <Box
      sx={{
        p: 4,
        borderRight: "outline",
        borderColor: "border",
        fontSize: 3,
        "& ul": {
          listStyleType: "none",
          p: 0,
          mx: 0,
          mt: 0,
          mb: 4,
        },
        "& li": {
          fontSize: 3,
          "& a": {
            textDecoration: "none",
            py: 2,
            display: "block",
            width: "100%",
          },
          "&:hover": {
            bg: "muted",
          },
        },
      }}
    >
      <Heading as="h1" sx={{ mb: 3 }}>
        State Designer
      </Heading>
      <Styled.p>
        Welcome to a <i>very</i> early build of the <b>State Designer</b> design
        environment. You can create and share projects and copy other user's
        projects. Lots more to come.
      </Styled.p>
      <Styled.p>
        Learn more at:{" "}
        <Styled.a href="https://state-designer.com">
          state-designer.com
        </Styled.a>
      </Styled.p>
      <Styled.p>
        Follow me for updates:{" "}
        <Styled.a href="https://twitter.com/steveruizok">@steveruizok</Styled.a>
      </Styled.p>
      <Styled.p>
        Join the <Styled.a href="https://discord.gg/ndmUtRW">Discord</Styled.a>
      </Styled.p>
      <Styled.hr />
      <Heading as="h2" sx={{ mb: 4 }}>
        Examples
      </Heading>
      <ul>
        {exampleLinks.map(({ name, id }, i) => (
          <li key={i}>
            <Link href={`/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/${id}`}>
              <Styled.a>{name}</Styled.a>
            </Link>
          </li>
        ))}
      </ul>
      <Styled.hr />
      <Button onClick={() => logout()} sx={{ width: "100%" }}>
        Log Out
      </Button>
      <Text sx={{ fontSize: 1, my: 2, textAlign: "center" }}>
        Signed in as
        <br />
        {user?.email}
      </Text>
    </Box>
  )
}

const Loading: React.FC<{}> = ({}) => {
  return <Flex sx={{ bg: "muted", m: 2 }}></Flex>
}

const PageLayout: React.FC<{}> = ({ children }) => {
  return (
    <Grid
      sx={{
        gridArea: "page",
        gridTemplateColumns: ["1fr", "320px 1fr"],
        gridTemplateRows: [null, "100%"],
        gridAutoRows: "auto",
        overflow: "hidden",
        overflowY: "scroll",
      }}
    >
      {children}
    </Grid>
  )
}

const Content: React.FC<{ data: UserProjectsResponse }> = ({ data }) => {
  const { user } = useUser()

  if (!(user && data)) {
    return <Loading />
  }

  return (
    <Box
      sx={{
        p: 4,
        overflow: "hidden",
        overflowY: "scroll",
        "& ul": {
          listStyleType: "none",
          p: 0,
          mx: 0,
          mt: 0,
          mb: 4,
          display: "flex",
          width: "100%",
          flexWrap: "wrap",
        },
        "& li": {
          "& a": {
            mb: 3,
            mr: 3,
            textDecoration: "none",
            fontSize: 3,
            p: 2,
            display: "inline-block",
            border: "outline",
            borderColor: "inactive",
            minWidth: 128,
            width: "fit-content",
            minHeight: 80,
            borderRadius: 8,
            fontFamily: "monospace",
            "&:hover": {
              borderColor: "accent",
            },
          },
        },
      }}
    >
      <Heading as="h1" sx={{ mt: 1, mb: 3 }}>
        Projects
      </Heading>
      <NewProjectForm uid={user.id} projects={data.projects} />
      <ul>
        {data.projects.map((pid, i) => (
          <li key={i}>
            <Link href={`/${user.id}/${pid}`}>
              <Styled.a>
                <Thumbnail />
                {pid}
              </Styled.a>
            </Link>
          </li>
        ))}
      </ul>
    </Box>
  )
}

const Thumbnail: React.FC = () => {
  return (
    <Box
      sx={{
        width: [128, 320],
        height: [96, 160],
        bg: "muted",
        borderRadius: 4,
      }}
    />
  )
}

const NewProjectForm: React.FC<Pick<
  UserProjectsResponse,
  "projects" | "uid"
>> = ({ uid, projects }) => {
  const local = useStateDesigner({
    data: {
      uid,
      value: "",
      error: " ",
    },
    initial: "editing",
    states: {
      editing: {
        initial: {
          if: "hasError",
          to: "invalid",
          else: { to: "valid" },
        },
        states: {
          invalid: {},
          valid: {
            on: { CREATED_PROJECT: { to: "loading" } },
          },
          unsure: {
            onEnter: { wait: 0.5, do: "setError", to: "editing" },
          },
        },
        on: {
          CHANGED_VALUE: { do: "setValue", to: "unsure" },
        },
      },
      loading: {},
    },
    conditions: {
      hasError(data) {
        return data.error !== ""
      },
    },
    actions: {
      setError(data) {
        if (data.value === "") {
          data.error = "Enter a Project ID."
        } else if (data.value.length < 3) {
          data.error = "Project ID must be at least 3 characters long."
        } else if (projects.includes(data.value)) {
          data.error = "A project with that ID already exists."
        } else {
          data.error = ""
        }
      },
      clearError(data) {
        data.error = ""
      },
      setValue(data, { value }) {
        data.value = value || ""
      },
    },
  })

  return (
    <Grid
      sx={{
        gridTemplateColumns: "1fr",
        gridAutoFlow: "row",
        width: ["100%", 320],
      }}
    >
      <Input
        placeholder="Enter a Project ID"
        value={local.data.value}
        onChange={(e) => {
          local.send("CHANGED_VALUE", { value: e.currentTarget.value })
        }}
      />
      <Button
        disabled={!local.isIn("valid")}
        onClick={() => {
          local.send("CREATED_PROJECT")
          createNewProject(local.data.value, uid, uid)
        }}
      >
        {local.isIn("loading") ? "Creating Project..." : "Create New Project"}
      </Button>
      <Text sx={{ fontSize: 1, height: 32 }}>{local.data.error}</Text>
    </Grid>
  )
}

const Controls: React.FC = ({}) => {
  const [colorMode, setColorMode] = useColorMode()

  return (
    <Flex sx={{}}>
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

export default User
