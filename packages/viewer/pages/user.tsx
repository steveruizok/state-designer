import useSWR from "swr"
import * as React from "react"
import Link from "next/link"
import { useUser } from "../auth/useUser"
import User from "../components/site/user"
import { UserProjectsResponse } from "../utils/firebase"
import { Styled, Text, Grid, Input, Heading, Flex, Button, Box } from "theme-ui"

const deadFetcher = () => {
  return undefined
}

const fetcher = (url: string, token: string) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({ "Content-Type": "application/json", token }),
    credentials: "same-origin",
  }).then((res) => res.json())

const Index = () => {
  const { user } = useUser()
  const { data } = useSWR<UserProjectsResponse>(
    [`/api/${user?.id}`, user?.token],
    user ? fetcher : deadFetcher
  )

  return <User data={data} />
}

export default Index
