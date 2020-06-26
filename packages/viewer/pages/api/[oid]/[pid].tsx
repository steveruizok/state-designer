// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import { verifyIdToken } from "../../../auth/firebaseAdmin"
import "firebase/firestore"
import { ProjectResponse, getProjectInfo } from "../../../utils/firebase"

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ProjectResponse>
) => {
  const { token } = req.headers
  let { pid, oid, uid } = req.query

  pid = Array.isArray(pid) ? pid[0] : pid
  oid = Array.isArray(oid) ? oid[0] : oid
  uid = Array.isArray(uid) ? uid[0] : uid

  // Check whether project exists, and whether the current user
  // is the owner of that project

  console.log(pid, oid, uid)

  const { isProject, isOwner } = await getProjectInfo(pid, oid, uid)

  try {
    await verifyIdToken(token)
    return res.status(200).json({
      oid,
      pid,
      uid,
      isProject,
      isOwner,
      isAuthenticated: true,
      error: undefined,
    })
  } catch (error) {
    return res.status(400).json({
      oid,
      pid,
      uid,
      isProject,
      isOwner,
      isAuthenticated: false,
      error,
    })
  }
}
