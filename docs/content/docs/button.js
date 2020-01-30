import React from 'react'

export default (props) => {
	const { children } = props

	return (
		<button
			style={{
				fontSize: 16,
				fontWeight: 600,
				backgroundColor: '#3333ff',
				color: '#ffffff',
				padding: '1rem 2rem',
				outline: 'none',
				border: 'none',
				borderRadius: 8,
				cursor: 'pointer',
			}}
			onClick={() => window.alert('Clicked!')}
		>
			{children}
		</button>
	)
}
