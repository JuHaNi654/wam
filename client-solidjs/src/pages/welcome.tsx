import { createRoute } from "@tanstack/solid-router"
import Root from "./layouts/root"
import PageHeading from "../components/page-heading"

export default createRoute({
  getParentRoute: () => Root,
  path: '/',
  component: Welcome
})

function Welcome() {
  return (
    <div>
      <PageHeading title="Welcome" />
    </div>
  )
}
