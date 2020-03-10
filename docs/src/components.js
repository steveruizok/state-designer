import React from "react"
import { Styled } from "theme-ui"
import kebabCase from "lodash-es/kebabCase"
import { GoMarkGithub } from "react-icons/go"
import { FaTwitter } from "react-icons/fa"

function Heading1(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink" id={id}>
        <h1 {...props} />
      </Styled.a>
    )
  }

  return <h1 {...props} />
}

function Heading2(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink" id={id}>
        <h2 {...props} />
      </Styled.a>
    )
  }

  return <h2 {...props} />
}

function Heading3(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink" id={id}>
        <h3 {...props} />
      </Styled.a>
    )
  }

  return <h3 {...props} />
}

function Heading4(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink" id={id}>
        <h4 {...props} />
      </Styled.a>
    )
  }

  return <h4 {...props} />
}

function Heading5(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink" id={id}>
        <h5 {...props} />
      </Styled.a>
    )
  }

  return <h5 {...props} />
}

function Heading6(props) {
  if (typeof props.children === "string") {
    const id = kebabCase(props.children)
    return (
      <Styled.a href={`#${id}`} variant="autolink" id={id}>
        <h6 {...props} />
      </Styled.a>
    )
  }

  return <h6 {...props} />
}

export default {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  GithubIcon: GoMarkGithub,
  TwitterIcon: FaTwitter
}
