import dynamic from "next/dynamic"

const FirebaseAuth = dynamic(() => import("../site/firebase-auth"), {
  ssr: false,
})

const Auth = ({ user }: { user: any }) => {
  console.log(user)
  return <FirebaseAuth />
}

export default Auth
