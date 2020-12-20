import { NextApiResponse, NextApiRequest } from "next"
import admin from "../../lib/firebase-admin"

export default async function logout(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const cookie = req.cookies[process.env.NEXT_PUBLIC_COOKIE_NAME]
    const decodedClaims = await admin.auth().verifySessionCookie(cookie)
    await admin.auth().revokeRefreshTokens(decodedClaims.sub)
    res.status(200)
    res.send({ response: "Logged out" })
  } else {
    res.status(400)
    res.send({ response: "You need to post to this endpoint." })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}
