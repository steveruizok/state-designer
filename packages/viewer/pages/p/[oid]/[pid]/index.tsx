import { GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { getCurrentUser } from "lib/auth-server"
import { getProjectData, getProjectInfo } from "lib/database"
import * as Types from "types"
import { single } from "utils"

import ProjectView from "components/project"

import dynamic from "next/dynamic"

interface ProjectPageProps {
  authState: Types.AuthState
  projectResponse: Types.ProjectResponse
}

const Site = dynamic(() => import("site/viewer"), {
  ssr: false,
})

export default function ProjectPage({
  authState,
  projectResponse,
}: ProjectPageProps) {
  return <ProjectView />
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<ProjectPageProps>> {
  const { oid, pid } = context.query

  const authState = await getCurrentUser(context)
    .then((d) => d)
    .catch((e) => {
      throw Error("Oh no " + e.message)
    })

  console.log(authState)

  const uid = authState.authenticated ? authState.user.uid : null
  const projectResponse = await getProjectInfo(single(pid), single(oid), uid)

  return {
    props: { authState, projectResponse },
  }
}
