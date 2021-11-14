import dynamic from "next/dynamic"

const FirebaseAuth = dynamic(() => import("../site/firebase-auth"), {
  ssr: false,
})

const Auth = () => {
  return <FirebaseAuth />
}

export default Auth
