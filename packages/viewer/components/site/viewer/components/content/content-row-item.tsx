// @jsx jsx
import { jsx, Styled } from "theme-ui"

const ContentRowItem: React.FC = ({ children }) => {
  return (
    <Styled.li
      sx={{
        bg: "background",
        display: "flex",
        alignItems: "center",
        pr: 1,
        "& button[data-hidey='true']": {
          visibility: "hidden",
        },
        "&:hover": {
          bg: "muted",
          "& button[data-hidey='true']": {
            bg: "none",
            visibility: "visible",
            "&:hover": {
              bg: "muted",
              color: "accent",
            },
            "&:disabled": {
              visibility: "hidden",
            },
          },
        },
        "&:focus": {
          outline: "none",
        },
      }}
    >
      {children}
    </Styled.li>
  )
}

export default ContentRowItem
