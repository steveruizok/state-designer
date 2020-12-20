import { GetServerSidePropsContext } from "next"
import { parseCookies } from "nookies"
import pick from "lodash/pick"

import admin from "./firebase-admin"
import * as Types from "types"

async function verifyCookie(
  cookie: string
): Promise<{
  authenticated: boolean
  user: Types.User
}> {
  if (!admin) return null

  let user: any = undefined
  let authenticated: boolean = false

  await admin
    .auth()
    .verifySessionCookie(cookie, true /** checkRevoked */)
    .then((decodedClaims: { [key: string]: any }) => {
      user = pick(decodedClaims, "name", "email", "picture", "uid")
      user.authenticated = true
      authenticated = true
    })
    .catch(() => {
      authenticated = false
    })

  return {
    authenticated,
    user,
  }
}
// Public API

export function redirectToAuthPage(context: GetServerSidePropsContext) {
  context.res.writeHead(303, { Location: "/auth" })
  context.res.end()
  return null
}

export function redirectToUserPage(context: GetServerSidePropsContext) {
  context.res.writeHead(303, { Location: "/user" })
  context.res.end()
  return null
}

export function redirectToNotFoundPage(context: GetServerSidePropsContext) {
  context.res.writeHead(303, { Location: "/404" })
  context.res.end()
  return null
}

export async function getCurrentUser(
  context?: GetServerSidePropsContext
): Promise<Types.AuthState> {
  const cookies = parseCookies(context)

  const result = {
    user: null,
    authenticated: false,
    error: "",
  }

  if (!cookies[process.env.NEXT_PUBLIC_COOKIE_NAME]) {
    result.error = "No cookie."
    return result
  }

  const authentication = await verifyCookie(
    cookies[process.env.NEXT_PUBLIC_COOKIE_NAME]
  )

  if (!authentication) {
    result.error = "Could not verify cookie."
    return result
  }

  const { user = null, authenticated = false } = authentication

  result.user = user
  result.authenticated = authenticated

  return result
}
