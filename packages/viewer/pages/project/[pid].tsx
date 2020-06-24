import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"
import { Flex, Spinner, Box, BoxProps } from "theme-ui"
import Site from "../../components/site"
import { useUser } from "../../auth/useUser"

const fetcher = (url: string, token: string) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({ "Content-Type": "application/json", token }),
    credentials: "same-origin",
  }).then((res) => res.json())

const Index = () => {
  const router = useRouter()
  const { pid } = router.query

  // Our custom hook to get context values
  const { user, logout } = useUser()

  const { data, error } = useSWR(
    [`/api/project/${pid}?user=${user?.id}`, user?.token],
    fetcher
  )

  return <Site data={data} />
}

export default Index
