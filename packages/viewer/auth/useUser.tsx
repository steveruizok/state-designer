import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import cookies from "js-cookie"
import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"
import initFirebase from "../auth/initFirebase"

initFirebase()

const useUser = () => {
  const [user, setUser] = useState<any>()
  const router = useRouter()

  useEffect(() => {
    const cookie = cookies.get("auth")
    if (cookie) {
      setUser(JSON.parse(cookie))
    }

    // if (!cookie) {
    //   router.push("/")
    //   return
    // }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = async () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        cookies.remove("auth")
        router.push("/auth")
      })
      .catch((e) => {
        console.error(e)
      })
  }

  return { user, logout }
}

export { useUser }
