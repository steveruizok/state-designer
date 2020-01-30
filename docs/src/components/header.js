/** @jsx jsx */
import { jsx, Header, Container, Flex } from 'theme-ui'
import { MDXProvider } from '@mdx-js/react'

import MenuButton from './menu-button'
import NavLink from './nav-link'
// @ts-ignore
import Content from '../../content/nav/header.mdx'

const components = {
	a: NavLink,
}

export default ({ menuOpen, setMenuOpen, nav }) => {
	return (
		<Header>
			<Container
				sx={{
					mx: [0, 'auto'],
					px: [1, 4],
					py: 0,
					position: ['fixed', 'relative'],
					top: 0,
					left: 0,
					backgroundColor: '#FFFFFF',
				}}
			>
				<Flex
					sx={{
						justifyContent: 'space-between',
						mx: [3, 0],
						pb: [2, 4],
						pt: [3, 4],
						height: '100%',
						borderColor: 'text',
						borderBottomStyle: 'solid',
						borderBottomWidth: '1px',
					}}
				>
					<Flex
						sx={{
							alignItems: 'center',
							justifyContent: 'center',
							width: '100%',
							m: 0,
							pb: 0,
							h1: {
								m: 0,
								fontSize: [3, 4],
								px: [2, 0],
								py: 2,
								lineHeight: 1,
								'& a': {
									fontSize: [2, 4],
									color: 'text',
									px: [0, 0],
									mr: 0,
								},
							},
							a: {
								px: 3,
								mr: -3,
							},
							ul: {
								my: 0,
								ml: 'auto',
								display: 'flex',
								listStyleType: 'none',
							},
							li: {},
						}}
					>
						<MenuButton
							sx={{ mr: 2 }}
							onClick={(e) => {
								setMenuOpen(!menuOpen)
								if (!nav.current) return
								const navLink = nav.current.querySelector('a')
								if (navLink) navLink.focus()
							}}
						/>
						<MDXProvider components={components}>
							<Content />
						</MDXProvider>
					</Flex>
				</Flex>
			</Container>
		</Header>
	)
}
