// @jsx jsx
import * as React from "react"
import { Sun, Moon } from "react-feather"
import Link from "next/link"
import { useRouter } from "next/router"
import { AdminResponse } from "../../utils/firebase"
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
import LoadingScreen from "../loading-screen"

const User: React.FC<{ data: AdminResponse }> = ({ data }) => {
  const router = useRouter()

  React.useEffect(() => {
    if (data && !data.isAuthenticated) {
      router.push("/auth")
    }
  }, [data])

  if (!data) return <LoadingScreen />

  let sorted: Record<string, any[]> = {}

  for (let project of data.projects) {
    if (sorted[project.owner]) {
      sorted[project.owner].push(project)
    } else {
      sorted[project.owner] = [project]
    }
  }

  return (
    <Box>
      <ul>
        {Object.entries(sorted).map(([id, projects], i) => (
          <li key={i}>
            <Box>{id}</Box>
            <ul>
              {projects.map(({ pid, name }, i) => (
                <li key={i}>
                  <Styled.a href={`/${id}/${pid}`}>{name}</Styled.a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Box>
  )
}

export default User
