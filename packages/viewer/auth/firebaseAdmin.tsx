import * as admin from "firebase-admin"

export const initializeAdmin = () => {
  const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // https://stackoverflow.com/a/41044630/1332513
        privateKey: firebasePrivateKey.replace(/\\n/g, "\n"),
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
  }

  return admin
}

export const verifyIdToken = (token: string | string[]) => {
  const singleToken = Array.isArray(token) ? token[0] : token

  initializeAdmin()

  return admin
    .auth()
    .verifyIdToken(singleToken)
    .catch((error) => {
      throw error
    })
}

export const revokeIdToken = async (uids: string | string[]) => {
  const uid = Array.isArray(uids) ? uids[0] : uids
  initializeAdmin()

  await admin.auth().revokeRefreshTokens(uid)
  const userRecord = await admin.auth().getUser(uid)
  const timestamp = new Date(userRecord.tokensValidAfterTime).getTime() / 1000
  // console.log("Tokens revoked at: ", timestamp)
}
