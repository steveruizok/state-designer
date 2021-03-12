/** @jsx jsx */
import { Styled, jsx } from "theme-ui";
import { MDXRenderer } from "gatsby-plugin-mdx";

import { Link } from "gatsby-plugin-modal-routing";
import { ModalRoutingContext } from "gatsby-plugin-modal-routing";

import Layout from "./layout";
import SEO from "./seo";

const Doc = ({ data: { doc } }) => {
  const headingTitle = doc.headings[0] && doc.headings[0].value;

  return (
    <ModalRoutingContext.Consumer>
      {({ modal, closeTo }) => {
        if (modal) {
          return (
            <Styled.root>
              <Styled.div
                sx={{
                  maxWidth: 600,
                  height: ["auto", "auto"],
                  maxHeight: ["calc(100vh - 16px)", "calc(100vh - 128px)"],
                  my: [2, 5],
                  mx: "auto",
                  pointerEvents: "all",
                  borderRadius: 8,
                  boxShadow: "modal",
                  overflowY: "scroll",
                  p: [3, 4],
                  bg: "background",
                }}
              >
                <Link to={closeTo}>Close</Link>
                <MDXRenderer>{doc.body}</MDXRenderer>
              </Styled.div>
            </Styled.root>
          );
        }

        return (
          <Layout>
            <SEO
              title={doc.title || headingTitle}
              description={doc.description || doc.excerpt}
            />
            <MDXRenderer>{doc.body}</MDXRenderer>
          </Layout>
        );
      }}
    </ModalRoutingContext.Consumer>
  );
};

export default Doc;
