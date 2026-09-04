import { createRoute } from "@tanstack/solid-router"
import ApplicationLayout from "./layouts/application"
import { useParams } from "@tanstack/solid-router"
import PageHeading from "../components/page-heading"

export default createRoute({
  getParentRoute: () => ApplicationLayout,
  path: '$applicationId',
  component: Application
})

function Application() {
  const ID = useParams({
    from: '/layout/applications/$applicationId',
    select: (params) => params.applicationId
  })

  return (
    <div>
      <PageHeading title={`Single application: ${ID()}`} />
    </div>
  )
}
