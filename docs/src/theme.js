import prismTheme from '@theme-ui/prism/presets/github.json'

const heading = {
	fontFamily: 'heading',
	fontWeight: 'heading',
	lineHeight: 'heading',
	a: {
		color: 'inherit',
		textDecoration: 'none',
	},
}

export default {
	breakpoints: ['52em', '90em', '100em'],
	colors: {
		text: '#000',
		code: '#272727',
		codeBg: '#f6f8fa',
		codeHl: '#e7ebed',
		muted: '#f6f8fa',
		background: '#fff',
		primary: '#3333ff',
		secondary: '#8855ff',
		highlight: '#03d8ff',
		gray: '#d8dde3',
	},
	fonts: {
		body: 'system-ui, sans-serif',
		heading: 'system-ui, sans-serif',
		monospace: 'Fira Code, Menlo, monospace',
	},
	fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
	fontWeights: {
		body: '400',
		heading: '700',
	},
	lineHeights: {
		body: 1.5,
		heading: 1.25,
	},
	textStyles: {
		heading,
		display: {
			variant: 'textStyles.heading',
			fontSize: [5, 6, 7],
			mt: 3,
		},
	},
	borderStyles: {
		quote: '1px solid secondary',
	},
	styles: {
		Container: {
			p: 3,
			maxWidth: 1024,
		},
		root: {
			fontFamily: 'body',
			lineHeight: 'body',
			fontWeight: 'body',
		},
		h1: {
			variant: 'textStyles.display',
		},
		h2: {
			variant: 'textStyles.heading',
			fontSize: 5,
		},
		h3: {
			variant: 'textStyles.heading',
			fontSize: 4,
		},
		h4: {
			variant: 'textStyles.heading',
			fontSize: 3,
		},
		h5: {
			variant: 'textStyles.heading',
			fontSize: 2,
		},
		h6: {
			variant: 'textStyles.heading',
			fontSize: 1,
		},
		a: {
			color: 'primary',
			textDecoration: 'none',
			'&:hover': {
				textDecoration: 'underline',
			},
		},
		blockquote: {
			m: 0,
			borderLeft: (theme) => `1px solid ${theme.colors.gray}`,
			pl: 4,
			pr: 2,
			py: 2,
			fontStyle: 'italic',
		},
		pre: {
			...prismTheme,
			variant: 'prism',
			maxWidth: '100%',
			tabSize: 2,
			fontFamily: 'monospace',
			fontSize: 1,
			p: 3,
			borderRadius: 4,
			overflow: 'scroll',
			scroll: 'auto',
			code: {
				color: 'inherit',
				bg: 'inherit',
				border: 'none',
				px: 0,
				borderRadius: 0,
			},
		},
		code: {
			fontFamily: 'monospace',
			color: 'code',
			bg: 'codeBg',
			fontWeight: 500,
			fontSize: 1,
			// border: '1px solid #efefef',
			px: 1,
			borderRadius: 4,
		},
		table: {
			width: '100%',
			my: 4,
			borderCollapse: 'separate',
			borderSpacing: 0,
			[['th', 'td']]: {
				textAlign: 'left',
				py: '4px',
				pr: '4px',
				pl: 0,
				borderColor: 'muted',
				borderBottomStyle: 'solid',
			},
			code: {
				mx: -1,
			},
		},
		th: {
			verticalAlign: 'bottom',
			borderBottomWidth: '2px',
		},
		td: {
			verticalAlign: 'top',
			borderBottomWidth: '1px',
		},
		hr: {
			border: 0,
			borderBottom: (theme) => `1px solid ${theme.colors.gray}`,
			mx: 'auto',
			my: 4,
		},
		ul: {
			my: 2,
		},
		ol: {
			my: 4,
		},
		li: {
			mb: 2,
		},
		p: {
			mb: 3,
		},
	},
	prism: {
		[['.gatsby-highlight-code-line']]: {
			display: 'block',
			fontWeight: '700',
			backgroundColor: 'codeHl',
		},
	},
}
