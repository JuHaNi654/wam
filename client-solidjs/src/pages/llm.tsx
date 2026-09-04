import { createRoute } from "@tanstack/solid-router"
import Layout from "./layouts/base"
import PageHeading from "../components/page-heading"

export default createRoute({
  getParentRoute: () => Layout,
  path: 'models',
  component: LLM
})

function LLM() {
  return (
    <div>
      <PageHeading title="Models" />
    </div>
  )
}
