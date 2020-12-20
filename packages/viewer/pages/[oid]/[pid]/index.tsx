import { GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { getCurrentUser } from "lib/auth-server"
import { getProjectData, getProjectInfo } from "lib/database"
import * as Types from "types"
import { single } from "utils"

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
  return <Site user={authState.user} response={projectResponse} />
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<ProjectPageProps>> {
  const { oid, pid } = context.query

  const authState = await getCurrentUser(context)
  const uid = authState.authenticated ? authState.user.uid : null
  const projectResponse = await getProjectInfo(single(pid), single(oid), uid)

  return {
    props: { authState, projectResponse },
  }
}
