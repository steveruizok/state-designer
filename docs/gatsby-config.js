module.exports = {
  siteMetadata: {
    title: "State Designer Docs",
    description: "Docs for the state-designer library.",
  },
  plugins: [
    "gatsby-plugin-theme-ui",
    "gatsby-plugin-react-helmet",
    `@pauliescanlon/gatsby-mdx-embed`,
    "gatsby-plugin-meta-redirect",
    "gatsby-plugin-typescript",
    "gatsby-plugin-redirects",
    `gatsby-plugin-sharp`,
    `gatsby-remark-images`,
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        extensions: [".md", ".mdx"],
        plugins: [`gatsby-remark-images`],
        gatsbyRemarkPlugins: [
          "gatsby-remark-smartypants",
          // "gatsby-remark-prismjs",
          "remark-slug",
          "remark-emoji",
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-modal-routing`,
      options: {
        // A selector to set react-modal's app root to, default is `#___gatsby`
        // See http://reactcommunity.org/react-modal/accessibility/#app-element
        appElement: "#___gatsby",

        // Object of props that will be passed to the react-modal container
        // See http://reactcommunity.org/react-modal/#usage
        modalProps: {
          className: "modal",
          shouldCloseOnOverlayClick: true,
        },
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content`,
        name: "content",
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        start_url: `/`,
        display: `standalone`,
        icon: `static/icon.png`,
        include_favicon: true,
      },
    },
  ],
}
