// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import { verifyIdToken } from "../../auth/firebaseAdmin"
import "firebase/firestore"
import { AdminResponse, addUser, getAdminData } from "../../utils/firebase"

export default async (
  req: NextApiRequest,
  res: NextApiResponse<AdminResponse>
) => {
  const { token } = req.headers
  let { uid } = req.query

  uid = Array.isArray(uid) ? uid[0] : uid

  // Check whether project exists, and whether the current user
  // is the owner of that project

  await addUser(uid)

  const projects = await getAdminData()

  try {
    await verifyIdToken(token)
    return res.status(200).json({
      projects,
      isAuthenticated: true,
      error: undefined,
    })
  } catch (error) {
    return res.status(400).json({
      projects,
      isAuthenticated: false,
      error,
    })
  }
}
