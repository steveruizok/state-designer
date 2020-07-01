// @jsx jsx
import { jsx, Box, Styled, BoxProps } from "theme-ui"

const ContentRowItem: React.FC<BoxProps> = (props) => {
  return (
    <Styled.li>
      <Box variant="contentRowItem" {...props} />
    </Styled.li>
  )
}

export default ContentRowItem
