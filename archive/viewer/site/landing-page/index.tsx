// @refresh reset
import * as React from "react"
import Link from "next/link"
import exampleLinks from "../static/example-links"
import {
  useColorMode,
  Image,
  Divider,
  Box,
  Flex,
  Button,
  Styled,
  Heading,
} from "theme-ui"
import ColorModeToggle from "../app/components/color-mode-toggle"

const Landing: React.FC<{}> = () => {
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
      <Link href={"/user"}>
        <Styled.a>
          <Button variant="bright" sx={{ minWidth: 200 }}>
            Get Started
          </Button>
        </Styled.a>
      </Link>
      <Divider />
      <Heading sx={{ mb: 5 }}>Examples</Heading>
      <Box variant="cardList">
        <ul>
          {exampleLinks.map(({ name, id }, i) => (
            <li key={i}>
              <Link href={`/6MPC5DDZS7fRjHRQuJRMRukYLbQ2/${id}`}>
                <Styled.a>{name}</Styled.a>
              </Link>
            </li>
          ))}
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

export default Landing
