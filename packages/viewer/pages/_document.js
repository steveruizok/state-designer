import { resetServerContext } from "react-beautiful-dnd"
import Document, { Html, Head, Main, NextScript } from "next/document"

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

CustomDocument.getInitialProps = async (ctx) => {
  resetServerContext()
  return Document.getInitialProps(ctx)
}

export default CustomDocument
