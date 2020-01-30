import React from 'react'
import { graphql } from 'gatsby'

import Doc from '../components/doc'

export default ({ data }) => <Doc data={data} />

export const pageQuery = graphql`
	query($id: String!) {
		doc: docs(id: { eq: $id }) {
			id
			title
			description
			excerpt
			body
			headings {
				value
			}
		}
	}
`
