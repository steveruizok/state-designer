/* globals window */
import { useStateDesigner } from "@state-designer/react"
import { useEffect, useState } from "react"
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth"
import firebase from "firebase/app"
import "firebase/auth"
import cookie from "js-cookie"
import { Project } from "./app/states/index"
import { Flex } from "theme-ui"
import initFirebase from "../auth/initFirebase"
import { setUserCookie } from "../auth/userCookies"
import { mapUserData } from "../auth/mapUserData"

import { addUser } from "../utils/firebase"

// Init the Firebase app.
initFirebase()

const firebaseAuthConfig = {
  signInFlow: "popup",
  // Auth providers
  // https://github.com/firebase/firebaseui-web#configure-oauth-providers
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false,
    },
  ],
  signInSuccessUrl: `/user`,
  credentialHelper: "none",
  callbacks: {
    uiShown: () => {
      Project.send("STARTED_AUTHENTICATING")
    },
    signInFailure: async (error) => {
      Project.send("AUTH_FAILED", { error })
    },
    signInSuccessWithAuthResult: async ({ user }, redirectUrl) => {
      const { uid } = user

      const userData = await mapUserData(user)
      setUserCookie(userData)

      if (uid) {
        addUser(uid)
      }

      Project.send("SIGNED_IN", { user, redirectUrl })
    },
  },
}

const FirebaseAuth: React.FC<{ redirect?: string }> = ({}) => {
  const local = useStateDesigner(Project)
  const [renderAuth, setRenderAuth] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRenderAuth(true)
    }
  }, [])

  return (
    <Flex variant="fullView">
      You can use this form to sign up, too!
      <br />
      <br />
      {renderAuth ? (
        <StyledFirebaseAuth
          uiConfig={
            {
              ...firebaseAuthConfig,
              signInSuccessUrl: local.whenIn({
                noProject: "/user",
                default: `/${local.data.oid}/${local.data.pid}`,
              }),
            } as any
          }
          firebaseAuth={firebase.auth()}
        />
      ) : null}
    </Flex>
  )
}

export default FirebaseAuth
