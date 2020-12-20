import { GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { getProjectData } from "lib/database"
import * as Types from "types"
import { single } from "utils"
import NotFound404 from "site/404"
import dynamic from "next/dynamic"
const Preview = dynamic(() => import("site/static-preview-page"), {
  ssr: false,
})

interface StaticPreviewPagePageProps {
  data: Types.ProjectData
}

/**
 * A preview page that will NOT subscribe to changes to the project document.
 */
export default function PreviewPage({ data }: StaticPreviewPagePageProps) {
  if (!data) return <NotFound404 />
  return <Preview data={data} />
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<StaticPreviewPagePageProps>> {
  const { oid, pid } = context.query
  const project = await getProjectData(single(pid), single(oid))

  return {
    props: { data: project },
  }
}
