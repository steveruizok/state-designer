import { getProjectData } from "../../../utils/firebase"
import { ProjectInfo } from "../../../utils/firebase"
import NotFound404 from "../../../site/404"
import { NextPage } from "next"
import dynamic from "next/dynamic"

const StaticPreviewPage = dynamic(
  () => import("../../../site/static-preview-page"),
  {
    ssr: false,
  }
)

/**
 * A preview page that will NOT subscribe to changes to the project document.
 */
const StaticPreview: NextPage<{ data: ProjectInfo }> = ({ data }) => {
  if (!data) return <NotFound404 />
  return <StaticPreviewPage data={data} />
}

StaticPreview.getInitialProps = async (ctx) => {
  let { oid, pid } = ctx.query

  pid = Array.isArray(pid) ? pid[0] : pid
  oid = Array.isArray(oid) ? oid[0] : oid

  if (!pid || !oid) return { data: undefined }

  const data = await getProjectData(pid, oid)

  return { data }
}

export default StaticPreview
