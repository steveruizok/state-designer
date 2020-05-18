/** @jsx jsx */
import { jsx, Flex } from "theme-ui"
import NavLink from "./nav-link"

export default ({ backTo, back, nextTo, next }) => {
  return (
    <Flex
      sx={{
        p: 0,
        mt: 6,
        justifyContent: next
          ? back
            ? "space-between"
            : "flex-end"
          : "flex-start",
      }}
    >
      {back && <NavLink href={backTo}>« Back to {back}</NavLink>}
      {next && (
        <NavLink style={{ textAlign: "right" }} href={nextTo}>
          Continue to {next} »
        </NavLink>
      )}
    </Flex>
  )
}
