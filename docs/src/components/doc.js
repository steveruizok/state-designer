/** @jsx jsx */
import { Styled, jsx } from "theme-ui"
import { Link } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import { ModalRoutingContext } from "gatsby-plugin-modal-routing"

import Layout from "./layout"
import SEO from "./seo"

const Doc = ({ data: { doc } }) => {
  const headingTitle = doc.headings[0] && doc.headings[0].value

  return (
    <ModalRoutingContext.Consumer>
      {({ modal, closeTo }) => {
        if (modal) {
          return (
            <Styled.root>
              <Styled.div
                sx={{
                  height: ["auto", "auto"],
                  maxHeight: ["calc(100vh - 16px)", "calc(100vh - 128px)"],
                  m: [2, 5],
                  pointerEvents: "all",
                  borderRadius: 8,
                  boxShadow: "modal",
                  overflowY: "scroll"
                }}
              >
                <Styled.div
                  sx={{
                    height: "100%",
                    p: [3, 4],
                    bg: "background"
                  }}
                >
                  <Link to={closeTo}>Close</Link>
                  <MDXRenderer>{doc.body}</MDXRenderer>
                </Styled.div>
              </Styled.div>
            </Styled.root>
          )
        }

        return (
          <Layout>
            <SEO
              title={doc.title || headingTitle}
              description={doc.description || doc.excerpt}
            />
            <MDXRenderer>{doc.body}</MDXRenderer>
          </Layout>
        )
      }}
    </ModalRoutingContext.Consumer>
  )
}

export default Doc
