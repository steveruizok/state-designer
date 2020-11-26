import useSWR from "swr"
import * as React from "react"
import { useUser } from "../auth/useUser"
import { AdminResponse } from "../utils/firebase"
import dynamic from "next/dynamic"

const Admin = dynamic(() => import("../site/admin"), {
  ssr: false,
})

const fetcher = (url: string, token: string) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({ "Content-Type": "application/json", token }),
    credentials: "same-origin",
  }).then((res) => res.json())

const Index = ({ user }: { user: any }) => {
  const { data } = useSWR<AdminResponse>(
    [`/api/admin?uid=${user?.id}`, user?.token],
    fetcher
  )

  return <Admin data={data} />
}

export default Index
