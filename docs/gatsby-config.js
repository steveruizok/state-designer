module.exports = {
	siteMetadata: {
		title: "QuickDocs",
		description: "Docs starter"
	},
	plugins: [
		"gatsby-plugin-meta-redirect",
		"gatsby-plugin-theme-ui",
		"gatsby-plugin-react-helmet",
		"gatsby-plugin-redirects",
		{
			resolve: "gatsby-plugin-mdx",
			options: {
				extensions: [".md", ".mdx"],
				gatsbyRemarkPlugins: [
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
			resolve: "gatsby-plugin-webfonts",
			options: {
				fonts: {
					google: [
						{
							family: "Fira Code",
							variants: ["500", "700"]
						}
					]
				}
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
};
