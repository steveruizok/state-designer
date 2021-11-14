/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import isAbsoluteURL from "is-absolute-url"

export default ({ href, style, children, silent = false, ...props }) => {
  const isExternal = isAbsoluteURL(href || "")

  const styles = {
    display: "block",
    px: 0,
    color: silent ? "text" : "primary",
    textDecoration: "none",
    fontSize: 3,
    fontFamily: "heading",
    fontWeight: "bold",
    "&.active": {
      color: "primary",
    },
    "&.visited": {
      color: "primary",
    },
    "&:hover": {
      textDecoration: "underline",
    },
    ...style,
  }

  if (isExternal) {
    return (
      <a {...props} href={href} sx={styles}>
        {children}
      </a>
    )
  }

  const to = props.to || href

  return (
    <Link {...props} to={to} sx={styles}>
      {children}
    </Link>
  )
}
