/** @jsx jsx */
import { jsx } from 'theme-ui'
import { MDXProvider } from '@mdx-js/react'
import Layout from './layout'

import Content from '../../content/nav/404.mdx'

export default () => {
	return (
		<Layout>
			<MDXProvider>
				<Content />
			</MDXProvider>
		</Layout>
	)
}
