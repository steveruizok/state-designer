/** @jsx jsx */
import { useState, useRef } from 'react'
import { Global } from '@emotion/core'
import { css } from '@styled-system/css'
import { Styled, Layout, Main, Container, jsx, useThemeUI } from 'theme-ui'

import Header from './header'
import Sidenav from './sidenav'
import Footer from './footer'

export default ({ children }) => {
	const { theme } = useThemeUI()
	const [menuOpen, setMenuOpen] = useState(false)
	const nav = useRef(null)

	const bodyStyles = {
		body: css({ bg: 'background', color: 'text' })(theme),
	}

	return (
		<Styled.root>
			<Global styles={bodyStyles} />
			<Layout>
				<Header nav={nav} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
				<Main>
					<Container py={0} px={3}>
						<div
							sx={{
								display: [null, 'flex'],
								mx: -3,
								width: '100%',
								mt: [5, 0],
							}}
						>
							<Sidenav
								ref={nav}
								open={menuOpen}
								sx={{ display: [null, 'block'] }}
								onFocus={() => setMenuOpen(true)}
								onBlur={() => setMenuOpen(false)}
								onClick={() => setMenuOpen(false)}
							/>
							<div
								sx={{
									px: [3, 0],
									width: '100%',
									overflow: 'hidden',
									mb: 2,
								}}
							>
								{children}
								<Footer />
							</div>
						</div>
					</Container>
				</Main>
			</Layout>
		</Styled.root>
	)
}
