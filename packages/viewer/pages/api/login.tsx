// /pages/api/login.tsx

import { serialize } from "cookie"
import { NextApiResponse, NextApiRequest } from "next"
import admin from "lib/firebase-admin"

const SESSION_DURATION_IN_DAYS = 5

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  const expiresIn = SESSION_DURATION_IN_DAYS * (24 * 60 * 60 * 1000)

  if (req.method !== "POST") {
    res.status(400)
    res.send({ response: "You need to post to this endpoint." })
    return
  }

  var idToken = req.body.token.toString()

  const decodedIdToken = await admin.auth().verifyIdToken(idToken)
  const cookie = await admin.auth().createSessionCookie(idToken, { expiresIn })

  if (!cookie) {
    res.status(401).send({ response: "Invalid authentication" })
    return
  }

  if (new Date().getTime() / 1000 - decodedIdToken.auth_time > 5 * 60) {
    res.status(401).send({ response: "Recent sign in required!" })
    return
  }

  const options = {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_SECURE_COOKIE === "true",
    path: "/",
  }

  res.setHeader(
    "Set-Cookie",
    serialize(process.env.NEXT_PUBLIC_COOKIE_NAME, cookie, options)
  )

  res.send({ response: "Logged in." })
}

export const config = {
  api: {
    externalResolver: true,
  },
}
