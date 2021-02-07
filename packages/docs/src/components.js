import React from "react"
import PageLinks from "./components/page-links"
import InlineLink from "./components/inline-link"
import { Styled } from "theme-ui"
import kebabCase from "lodash/kebabCase"
import { GoMarkGithub } from "react-icons/go"
import { FaTwitter } from "react-icons/fa"
import LiveView from "./components/live-view"
import { CounterToggle } from "./components/counter-toggle"
import CodeSandboxTutorial from "./components/codesandbox"
import YouTubeEmbed from "./components/youtube"
import Code from "./components/CodeBlock"

function Heading1(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink">
        <h1 id={id} {...props}>
          {props.children}
        </h1>
      </Styled.a>
    )
  }

  return <h1 {...props}>{props.children}</h1>
}

function Heading2(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink">
        <h2 id={id} {...props}>
          {props.children}
        </h2>
      </Styled.a>
    )
  }

  const id = kebabCase(props.children.props.children)

  return (
    <h2 {...props} id={id}>
      {props.children}
    </h2>
  )
}

function Heading3(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink">
        <h3 id={id} {...props}>
          {props.children}
        </h3>
      </Styled.a>
    )
  }

  const id = kebabCase(props.children.props.children)

  return (
    <h3 {...props} id={id}>
      {props.children}
    </h3>
  )
}

function Heading4(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink">
        <h4 id={id} {...props}>
          {props.children}
        </h4>
      </Styled.a>
    )
  }

  return <h4 {...props}>{props.children}</h4>
}

function Heading5(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink">
        <h5 id={id} {...props}>
          {props.children}
        </h5>
      </Styled.a>
    )
  }

  return <h5 {...props}>{props.children}</h5>
}

function Heading6(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink">
        <h6 id={id} {...props}>
          {props.children}
        </h6>
      </Styled.a>
    )
  }

  return <h6 {...props}>{props.children}</h6>
}

export default {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  a: InlineLink,
  GithubIcon: GoMarkGithub,
  TwitterIcon: FaTwitter,
  LiveView,
  PageLinks,
  CounterToggle,
  CodeSandboxTutorial,
  YouTubeEmbed,
  pre: (props) => <div {...props} />,
  code: Code,
}
