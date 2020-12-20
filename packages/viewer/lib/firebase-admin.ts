import atob from "atob"
import admin from "firebase-admin"

var serviceAccount = JSON.parse(atob(process.env.NEXT_PUBLIC_SERVICE_ACCOUNT))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  })
}

export default admin
