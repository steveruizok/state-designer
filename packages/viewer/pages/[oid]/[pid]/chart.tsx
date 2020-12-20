import { GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { getProjectData } from "lib/database"
import * as Types from "types"
import { single } from "utils"
import NotFound404 from "site/404"
import dynamic from "next/dynamic"
const Chart = dynamic(() => import("site/chart-page"), { ssr: false })

interface ChartPageProps {
  data: Types.ProjectData
}

/**
 * A preview page that WILL subscribe to changes to the project document in Firebase.
 * It's not "live" to the dirty changes — only saved changes will cause an update.
 */
export default function ChartPage({ data }: ChartPageProps) {
  if (!data) return <NotFound404 />
  return <Chart data={data} />
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<ChartPageProps>> {
  const { oid, pid } = context.query
  const project = await getProjectData(single(pid), single(oid))

  return {
    props: { data: project },
  }
}
