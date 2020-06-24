import * as React from "react"
import FooterColumn from "./column"

const Send: React.FC = (props) => {
  return <FooterColumn sx={{ gridArea: "send" }}>Send</FooterColumn>
}

export default Send
