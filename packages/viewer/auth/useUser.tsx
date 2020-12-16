import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import cookies from "js-cookie"
import firebase from "firebase/app"
import "firebase/firestore"
import initFirebase from "../auth/initFirebase"

initFirebase()

const useUser = () => {
  const [user, setUser] = useState<{
    id: string
    email: string
    token: string
  }>()

  const router = useRouter()

  useEffect(() => {
    // Get user info from cookie
    const cookie = cookies.get("auth")

    if (cookie) {
      setUser(JSON.parse(cookie))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh ID token on each page load, if user is logged in
  useEffect(() => {
    const user = firebase.auth().currentUser
    let cancel: any
    if (user) {
      user.getIdToken()
      cancel = setTimeout(() => {
        user.getIdToken()
      }, 10 * 60 * 1000)
    } else {
      console.log("Error: no user.")
    }

    return () => {
      if (cancel !== undefined) {
        clearTimeout(cancel)
      }
    }
  }, [])

  const logout = async () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        cookies.remove("auth")
        router.push("/")
      })
      .catch((e) => {
        console.error("Logout error:", e)
      })
  }

  return { user, logout }
}

export { useUser }
