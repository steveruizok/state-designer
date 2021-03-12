// @refresh reset
import * as React from "react"
import { Heading, Button, Flex } from "theme-ui"
import { useRouter } from "next/router"

const NotFound404: React.FC<{}> = () => {
  const router = useRouter()
  return (
    <Flex variant="fullView" sx={{ height: "100vh", width: "100vw" }}>
      <Heading mb={4}>Page Not Found</Heading>
      <Flex>
        <Button mr={4} onClick={() => router.back()}>
          Back
        </Button>
        <Button onClick={() => router.push("/")}>Home</Button>
      </Flex>
    </Flex>
  )
}

export default NotFound404
