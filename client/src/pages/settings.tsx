import { createRoute } from "@tanstack/solid-router"
import Layout from "./layouts/base"
import PageHeading from "../components/page-heading"
import ScrapeTargetListing from "../components/settings/scrape"
import { TScrapeTarget } from "../models/models"
import { GET } from "../utils/api"

type SettingsResponse = {
  id: string
  targets: Array<TScrapeTarget>
}

const settingsRoute = createRoute({
  getParentRoute: () => Layout,
  path: 'settings',
  component: Settings,
  loader: () => GET<SettingsResponse>("/settings", null)
})

function Settings() {
  const settings = settingsRoute.useLoaderData()

  return (
    <div>
      <PageHeading title="Settings" />
      <ScrapeTargetListing items={settings().response?.data.targets || []} />
    </div>
  )
}

export default settingsRoute
