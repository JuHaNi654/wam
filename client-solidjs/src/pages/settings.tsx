import { createRoute } from "@tanstack/solid-router"
import Layout from "./layouts/base"
import PageHeading from "../components/page-heading"

export default createRoute({
  getParentRoute: () => Layout,
  path: 'settings',
  component: Settings
})

function Settings() {
  return (
    <div>
      <PageHeading title="Settings" />
    </div>
  )
}
