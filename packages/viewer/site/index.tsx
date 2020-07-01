// @refresh reset
import * as React from "react"
import Link from "next/link"
import { useUser } from "../auth/useUser"
import {
  useColorMode,
  Image,
  Divider,
  Box,
  Flex,
  Button,
  Styled,
  Text,
  Heading,
} from "theme-ui"
import ColorModeToggle from "./app/components/color-mode-toggle"

const App: React.FC<{}> = () => {
  const { user } = useUser()
  const [colorMode] = useColorMode()

  return (
    <Flex sx={{ mt: 6, flexDirection: "column", alignItems: "center" }}>
      <ColorModeToggle sx={{ position: "absolute", top: 2, right: 2 }} />
      <Image
        alt="State Designer"
        sx={{ height: 44 }}
        src={colorMode === "dark" ? "/lockup_dark.svg" : "/lockup_light.svg"}
      />
      <Link href={"/auth"}>
        <Image
          sx={{ maxHeight: "70vh", my: 5, width: "auto", cursor: "pointer" }}
          src={colorMode === "dark" ? "/splash_dark.png" : "/splash_light.png"}
        />
      </Link>
      {user ? (
        <Text>Logging In...</Text>
      ) : (
        <Link href={"/auth"}>
          <Styled.a>
            <Button variant="bright" sx={{ minWidth: 200 }}>
              Get Started
            </Button>
          </Styled.a>
        </Link>
      )}
      <Divider />
      <Heading sx={{ mb: 5 }}>Examples</Heading>
      <Box variant="cardList">
        <ul>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/toggle">
              <Styled.a>Toggle</Styled.a>
            </Link>
          </li>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/counter">
              <Styled.a>Counter</Styled.a>
            </Link>
          </li>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/input">
              <Styled.a>Todo</Styled.a>
            </Link>
          </li>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/editor">
              <Styled.a>Editor</Styled.a>
            </Link>
          </li>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/accordion">
              <Styled.a>Accordion</Styled.a>
            </Link>
          </li>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/dogs">
              <Styled.a>Dog Pics</Styled.a>
            </Link>
          </li>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/timer">
              <Styled.a>Timer</Styled.a>
            </Link>
          </li>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/tiles">
              <Styled.a>Tiles Game</Styled.a>
            </Link>
          </li>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/calculator">
              <Styled.a>Calculator</Styled.a>
            </Link>
          </li>
          <li>
            <Link href="/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/tetris">
              <Styled.a>Tetris</Styled.a>
            </Link>
          </li>
        </ul>
      </Box>
      <Styled.p style={{ textAlign: "center" }}>
        Made with 🍕 in London
        <br />
        Copyright 2020{" "}
        <Styled.a href="https://twitter.com/steveruizok">Steve Ruiz</Styled.a>
      </Styled.p>
      <Divider />
    </Flex>
  )
}

export default App
