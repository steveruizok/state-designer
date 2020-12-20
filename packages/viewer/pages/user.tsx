import { GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { getCurrentUser, redirectToAuthPage } from "lib/auth-server"
import { getUserProjects } from "lib/database"
import * as Types from "types"
import dynamic from "next/dynamic"
const User = dynamic(() => import("site/user"), { ssr: false })

interface UserPageProps {
  authState: Types.AuthState
  data: Types.UserProjectsResponse
}

export default function UserPage({ authState, data }: UserPageProps) {
  return <User user={authState.user} data={data} />
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<UserPageProps>> {
  const authState = await getCurrentUser(context)

  if (!authState.authenticated) {
    redirectToAuthPage(context)
    return
  }

  const { uid } = authState.user
  const data = await getUserProjects(uid, uid)

  return {
    props: { authState, data },
  }
}
