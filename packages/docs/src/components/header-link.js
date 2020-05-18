/** @jsx jsx */
import { jsx } from "theme-ui"
import NavLink from "./nav-link"

export default ({ ...props }) => {
  return <NavLink {...props} silent={true} />
}
