// @jsx jsx
import * as React from "react"
import { useRouter } from "next/router"
import { AdminResponse } from "../../utils/firebase"
import { jsx, Styled, Box } from "theme-ui"
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
    if (sorted[project.oid]) {
      sorted[project.oid].push(project)
    } else {
      sorted[project.oid] = [project]
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
