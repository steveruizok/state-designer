/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import isAbsoluteURL from "is-absolute-url"

const styles = {
  display: "block",
  mx: -2,
  px: 2,
  py: 0,
  borderRadius: 4,
  lineHeight: 2,
  color: "text",
  textDecoration: "none",
  fontSize: [4, 1],
  fontFamily: "body",
  fontWeight: 2,
  color: "code",
  "&.active": {
    color: "text",
    backgroundColor: "muted",
  },
  "&.visited": {},
  "&:hover": {
    color: "text",
    backgroundColor: "muted",
  },
  "& code": {
    mx: -1,
    fontSize: [4, 0],
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
