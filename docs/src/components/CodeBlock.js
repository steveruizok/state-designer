/** @jsx jsx */
import { Component } from "react"
import { jsx, Styled } from "theme-ui"
import Prism from "@theme-ui/prism"
import prismTheme from "prism-react-renderer/themes/dracula"
import {
  createState,
  useStateDesigner,
  createDesign,
} from "@state-designer/react"
import { LiveProvider, LiveEditor, LivePreview, LiveError } from "react-live"
import * as themeUI from "theme-ui"

const scope = {
  ...themeUI,
  createState,
  useStateDesigner,
  createDesign,
  log: (message) => (
    <pre style={{ margin: 0 }}>
      <code>
        {typeof message === "string"
          ? message
          : JSON.stringify(message, null, 2)}
      </code>
    </pre>
  ),
  Link: (props) => {
    if (props.activeClassName)
      return <span className={props.activeClassName} {...props} />
    return <span {...props} sx={{ cursor: "pointer" }} />
  },
}

const transformLogCode = (src) =>
  `/** @jsx jsx */\n() => { ${src} return <div/> }`

const transformComponentCode = (src) => `/** @jsx jsx */\n${src}`

class SafeCode extends Component {
  state = { errorMessage: "" }

  static getDerivedStateFromError(error) {
    return { errorMessage: error.message }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorMessage: error.message })
  }

  render() {
    return this.state.errorMessage ? (
      <div>{this.state.errorMessage}</div>
    ) : (
      this.props.children
    )
  }
}

export const LiveCode = ({ children, preview, log }) => {
  const code = children.replace(/\/\/ prettier-ignore\n/, "")
  if (preview) {
    return (
      <LiveProvider
        theme={prismTheme}
        code={code}
        scope={scope}
        transformCode={log ? transformLogCode : transformComponentCode}
      >
        <LivePreview />
      </LiveProvider>
    )
  }

  return (
    <LiveProvider
      theme={prismTheme}
      code={code}
      scope={scope}
      transformCode={log ? transformLogCode : transformComponentCode}
    >
      <div
        sx={{
          px: 5,
          py: 6,
          mx: -3,
          mb: 2,
          mt: -2,
          bg: "dim",
          color: "background",
          borderRadius: 2,
          position: "relative",
        }}
      >
        <SafeCode>
          <LivePreview />
        </SafeCode>
        <span
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            fontSize: 0,
            color: "grey",
          }}
        >
          PREVIEW
        </span>
        <LiveError
          sx={{
            fontFamily: "monospace",
            fontSize: 0,
            color: "highlight",
            bg: "none",
            overflow: "auto",
          }}
        />
      </div>
      <Styled.pre sx={{ padding: 0, position: "relative", mb: 1, pb: 0 }}>
        <span
          sx={{
            position: "absolute",
            top: 0,
            right: 2,
            fontSize: 0,
            color: "grey",
          }}
        >
          CODE
        </span>
        <LiveEditor
          padding={16}
          style={{
            backgroundColor: "none",
            border: "none",
            outline: "none",
            fontFamily: "'Fira Code', monospace",
            fontWeight: 300,
            lineHeight: 1.5,
            fontSize: 15,
          }}
        />
      </Styled.pre>
    </LiveProvider>
  )
}

export default (props) => {
  if (props.live) {
    return <LiveCode {...props} />
  }

  return <Prism {...props} />
}
