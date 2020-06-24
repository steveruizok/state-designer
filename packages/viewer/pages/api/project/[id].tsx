// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next"
import { verifyIdToken, revokeIdToken } from "../../../auth/firebaseAdmin"
import firebase from "firebase/app"
import "firebase/firestore"

type Data = {
  id: string | string[]
  auth: boolean
  project?: boolean
  owner: boolean
  message: string
  error?: Error
}

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const {
    query: { id, user },
  } = req

  const pid = Array.isArray(id) ? id[0] : id

  const { token } = req.headers

  const db = firebase.firestore()
  const projects = db.collection("projects")
  const project = projects.doc(pid)
  const initial = await project.get()

  const owner = initial?.data()?.owner === user

  // 1. Verify ID Token
  // 2. Verify id exists in user's Firebase data
  // 3. Return id
  // 4. In component, get / post to Firebase store

  try {
    await verifyIdToken(token)
    return res.status(200).json({
      id: pid,
      auth: true,
      project: initial.exists,
      owner,
      message: "Authorized",
      error: undefined,
    })
  } catch (error) {
    try {
      // console.log(user)

      return res.status(200).json({
        id: pid,
        auth: true,
        project: initial.exists,
        owner,
        message: "Refreshed",
        error,
      })
    } catch (err2) {
      // console.log("Error in refreshing", err2)
    }

    return res.status(400).json({
      id: pid,
      auth: false,
      project: initial.exists,
      owner,
      message: "Error: " + error.message,
      error,
    })
  }
}
