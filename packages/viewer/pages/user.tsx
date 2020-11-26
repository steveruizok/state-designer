import useSWR from "swr"
import * as React from "react"
import { useUser } from "../auth/useUser"
import { UserProjectsResponse } from "../utils/firebase"
import { getUserFromCookie } from "../auth/userCookies"
import dynamic from "next/dynamic"

const User = dynamic(() => import("../site/user"), {
  ssr: false,
})

const fetcher = (url: string, token: string, user: any) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({ "Content-Type": "application/json", token }),
    credentials: "same-origin",
  }).then((res) => {
    return res.json()
  })

const Index = ({ user }: { user: any }) => {
  const { data } = useSWR<UserProjectsResponse>(
    [`/api/${user?.id}?uid=${user?.id}`, user?.token],
    fetcher
  )

  return <User user={user} data={data} />
}

export default Index
