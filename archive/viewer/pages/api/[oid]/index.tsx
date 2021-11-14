// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import { verifyIdToken } from "../../../auth/firebaseAdmin"
import "firebase/firestore"
import {
  UserProjectsResponse,
  getUserProjects,
  addUser,
} from "../../../utils/firebase"

export default async (
  req: NextApiRequest,
  res: NextApiResponse<UserProjectsResponse>
) => {
  const { token } = req.headers
  let { oid, uid } = req.query

  oid = Array.isArray(oid) ? oid[0] : oid
  uid = Array.isArray(uid) ? uid[0] : uid

  // Check whether project exists, and whether the current user
  // is the owner of that project

  const { projects } = await getUserProjects(oid)

  await addUser(uid)

  try {
    await verifyIdToken(token)
    return res.status(200).json({
      oid,
      uid,
      projects,
      isOwner: true,
      isAuthenticated: true,
      error: undefined,
    })
  } catch (error) {
    console.log("Could not verify token:", error.message)
    return res.status(400).json({
      oid,
      uid,
      projects,
      isOwner: true,
      isAuthenticated: false,
      error,
    })
  }
}
