import { GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { getProjectData } from "lib/database"
import * as Types from "types"
import { single } from "utils"
import NotFound404 from "site/404"
import dynamic from "next/dynamic"
const Preview = dynamic(() => import("site/preview-page"), { ssr: false })

interface PreviewPagePageProps {
  data: Types.ProjectData
}

/**
 * A preview page that WILL subscribe to changes to the project document on Firebase.
 * It's not "live" to the dirty changes — only saved changes will cause an update.
 */
export default function PreviewPage({ data }: PreviewPagePageProps) {
  if (!data) return <NotFound404 />
  return <Preview data={data} />
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<PreviewPagePageProps>> {
  const { oid, pid } = context.query
  const project = await getProjectData(single(pid), single(oid))

  return {
    props: { data: project },
  }
}
