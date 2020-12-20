import { useEffect } from "react"
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { getCurrentUser, redirectToUserPage } from "lib/auth-server"
import { login } from "lib/auth-client"
import * as Types from "types"

export default function Auth({ error }: Types.AuthState) {
  useEffect(() => {
    login()
  }, [])

  return <div></div>
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Types.AuthState>> {
  const authState = await getCurrentUser(context)

  if (authState.user) redirectToUserPage(context)

  return {
    props: authState,
  }
}
