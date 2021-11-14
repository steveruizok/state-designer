/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby-plugin-modal-routing"
import isAbsoluteURL from "is-absolute-url"

export default ({ href, children, ...props }) => {
  const isExternal = isAbsoluteURL(href || "")

  if (isExternal) {
    return (
      <a {...props} href={href}>
        {children}
      </a>
    )
  }

  const to = props.to || href

  const isModal = to.includes("definitions")

  return (
    <Link
      {...props}
      sx={{ color: isModal ? "#FF0000 !important" : undefined }}
      to={to}
      asModal={isModal}
    >
      {children}
    </Link>
  )
}
