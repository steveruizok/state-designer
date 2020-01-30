/** @jsx jsx */
import { jsx } from "theme-ui";
import { Link } from "gatsby";
import isAbsoluteURL from "is-absolute-url";

const styles = {
	display: "block",
	py: 1,
	mx: 0,
	color: "inherit",
	textDecoration: "none",
	fontSize: 2,
	fontFamily: "heading",
	fontWeight: "bold",
	"&.active": {
		color: "primary"
	},
	"&:hover": {
		textDecoration: "underline"
	}
};

export default ({ href, children, ...props }) => {
	const isExternal = isAbsoluteURL(href || "");

	if (isExternal) {
		return (
			<a {...props} href={href} sx={styles}>
				{children}
			</a>
		);
	}

	const to = props.to || href;

	return (
		<Link {...props} to={to} sx={styles} activeClassName={"active"}>
			{children}
		</Link>
	);
};
