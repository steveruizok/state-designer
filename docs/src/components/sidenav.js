/** @jsx jsx */
import React from "react";
import { jsx } from "theme-ui";
import { Sidenav } from "@theme-ui/sidenav";

import SidebarLink from "./sidebar-link";
import Content from "../../content/nav/sidebar.mdx";

export default React.forwardRef((props, ref) => (
	<Sidenav
		{...props}
		components={{
			a: SidebarLink
		}}
		ref={ref}
		sx={{
			width: ["100%", 200],
			flex: "none",
			pl: [20, 4],
			pt: 4,
			pb: 4,
			mx: 0,
			mt: [57, 0],
			mr: [0, 4],
			transition: "none"
		}}
	>
		<Content />
	</Sidenav>
));
