import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import cookies from "js-cookie"
import firebase from "firebase/app"
import "firebase/firestore"
import initFirebase from "./initFirebase"

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
    const currentUser = firebase.auth().currentUser
    let cancel: any
    if (currentUser) {
      // Every 59 minutes, refresh the user's token.
      cancel = setInterval(() => {
        currentUser.getIdToken(true).then((token) => {
          const userData = JSON.parse(cookies.get("auth"))

          userData.token = token

          cookies.set("auth", userData, { expires: 1 / 24 })

          console.log("Refreshed user token.")

          setUser(userData)
        })
      }, 59 * 60 * 1000)

      // Eventually, replace the above with purely server-side
      // authentication. (See your own gist where you've done
      // this already.)
    } else {
      console.log("Error: no user.")
    }

    return () => {
      if (cancel !== undefined) {
        clearInterval(cancel)
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
