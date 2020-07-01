import useSWR from "swr"
import * as React from "react"
import { useUser } from "../auth/useUser"
import Admin from "../site/admin"
import { AdminResponse } from "../utils/firebase"

const fetcher = (url: string, token: string) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({ "Content-Type": "application/json", token }),
    credentials: "same-origin",
  }).then((res) => res.json())

const Index = () => {
  const { user } = useUser()

  const { data } = useSWR<AdminResponse>(
    [`/api/admin?uid=${user?.id}`, user?.token],
    fetcher
  )

  return <Admin data={data} />
}

export default Index
