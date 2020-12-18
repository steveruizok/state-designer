// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import { verifyIdToken } from "../../auth/firebaseAdmin"
import cookie from "js-cookie"
import "firebase/firestore"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.headers

  try {
    await verifyIdToken(token)

    return res.status(200).json({
      isAuthenticated: true,
      error: undefined,
    })
  } catch (error) {
    console.log("Could not verify token:", error.message)
    return res.status(400).json({
      isAuthenticated: false,
      error,
    })
  }
}
