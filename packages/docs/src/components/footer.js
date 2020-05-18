/** @jsx jsx */
import { jsx, Container } from "theme-ui"
import { MDXProvider } from "@mdx-js/react"
// @ts-ignore
import Content from "../../content/nav/footer.mdx"

export default () => {
  return (
    <footer>
      <Container
        sx={{
          my: 6,
          pt: 2,
          px: 0,
        }}
      >
        <MDXProvider>
          <Content />
        </MDXProvider>
      </Container>
    </footer>
  )
}
