/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import isAbsoluteURL from "is-absolute-url"

const styles = {
  display: "block",
  mx: 0,
  color: "text",
  textDecoration: "none",
  fontSize: 2,
  fontFamily: "body",
  fontWeight: 2,
  "&.active": {
    color: "primary",
  },
  "&.visited": {
    color: "primary",
  },
  "&:hover": {
    textDecoration: "underline",
  },
  "& code": {
    fontSize: 1,
    color: "text",
  },
}

export default ({ href, children, ...props }) => {
  const isExternal = isAbsoluteURL(href || "")

  if (isExternal) {
    return (
      <a {...props} href={href} sx={styles}>
        {children}
      </a>
    )
  }

  const to = props.to || href

  return (
    <Link {...props} to={to} sx={styles} activeClassName={"active"}>
      {children}
    </Link>
  )
}
