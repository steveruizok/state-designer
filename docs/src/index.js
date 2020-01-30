import React from 'react'
import { ThemeProvider, Styled } from 'theme-ui'
import theme from './theme'
import components from './components'

export const wrapRootElement = ({ element }) => (
	<ThemeProvider theme={theme} components={components}>
		<Styled.root>{element}</Styled.root>
	</ThemeProvider>
)
