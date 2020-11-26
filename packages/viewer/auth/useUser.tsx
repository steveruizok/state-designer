import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import firebase from "firebase/app"
import "firebase/auth"
import initFirebase from "../auth/initFirebase"
import {
  removeUserCookie,
  setUserCookie,
  getUserFromCookie,
} from "./userCookies"
import { mapUserData } from "./mapUserData"

initFirebase()

type User = {
  id: string
  email: string
  token: string
  time: number
}

const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const logout = async () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        router.push("/auth")
      })
      .catch((e) => {
        console.error(e)
      })
  }

  useEffect(() => {
    // Firebase updates the id token every hour, this
    // makes sure the react state and the cookie are
    // both kept up to date
    const cancelAuthListener = firebase
      .auth()
      .onIdTokenChanged(async (user) => {
        if (user) {
          const userData = await mapUserData(user)
          setUserCookie(userData)
          setUser({ ...userData, time: Date.now() })
        } else {
          removeUserCookie()
          setUser(null)
        }
      })

    const userFromCookie = getUserFromCookie()
    if (!userFromCookie) {
      router.push("/")
      return
    }

    // setUser(userFromCookie || null)

    return () => {
      console.log("running cleanup")
      cancelAuthListener()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    router.events.on("routeChangeComplete", () => {
      if (user?.token) {
        const remaining = Date.now() - user.time
        if (remaining < 1000 * 60 * 5) {
          firebase
            .auth()
            .currentUser.getIdToken(true)
            .then((token) => {
              setUser((user) => ({
                ...user,
                token,
                time: Date.now(),
              }))
            })
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, logout }
}

export { useUser }
