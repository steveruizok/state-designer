import React from 'react'
import { MDXRenderer } from 'gatsby-plugin-mdx'

import Layout from './layout'
import SEO from './seo'

const Doc = ({ data: { doc } }) => {
	const headingTitle = doc.headings[0] && doc.headings[0].value

	return (
		<Layout>
			<SEO
				title={doc.title || headingTitle}
				description={doc.description || doc.excerpt}
			/>
			<MDXRenderer>{doc.body}</MDXRenderer>
		</Layout>
	)
}

export default Doc
