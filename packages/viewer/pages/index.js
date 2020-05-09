import Head from "next/head"
import { Chart } from "../components/Chart"

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>State Designer Viewer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Chart />
      </main>
    </div>
  )
}
