module.exports = {
  siteMetadata: {
    title: "State Designer Docs",
    description: "Docs for the state-designer library."
  },
  plugins: [
    `@pauliescanlon/gatsby-mdx-embed`,
    "gatsby-plugin-meta-redirect",
    "gatsby-plugin-theme-ui",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-redirects",
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        extensions: [".md", ".mdx"],
        gatsbyRemarkPlugins: [
          "gatsby-remark-smartypants",
          "gatsby-remark-prismjs",
          "remark-slug",
          "remark-emoji"
        ]
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: "content",
        name: "content"
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        start_url: `/`,
        display: `standalone`,
        icon: `static/icon.png`,
        include_favicon: true
      }
    }
  ]
}
