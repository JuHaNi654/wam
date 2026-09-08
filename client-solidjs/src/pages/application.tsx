import { createRoute } from "@tanstack/solid-router"
import ApplicationLayout from "./layouts/application"
import PageHeading from "../components/page-heading"
import { GET } from "../utils/api"
import { TSavedAction, TSavedApplication, TSkill } from "../models/models"
import { renderDate } from "../utils/date"
import Documents from "../components/documents"
import Tags from "../components/tags"
import Actions from "../components/actions"

type Response = {
  application: TSavedApplication;
  actions: Array<TSavedAction>;
  skills: Array<TSkill>;
}

const applicationRoute = createRoute({
  getParentRoute: () => ApplicationLayout,
  path: '$applicationId',
  component: Application,
  loader: ({ params }) => GET<Response>(`/applications/${params.applicationId}`, null)
})

function Application() {
  const result = applicationRoute.useLoaderData()

  const updateTags = async (tags: Array<TSkill>) => { }

  return (
    <div class="flex flex-col gap-3">
      <PageHeading title={result().response!.data.application.name} />
      <section class="ring-1 ring-white/20 bg-zinc-800 rounded-lg p-4">
        <header>
          <h3 class="text-md font-display font-semibold uppercase tracking-wide">Details</h3>
        </header>
        <div class="flex flex-col gap-2">
          <div class="text-sm">
            <h4 class="font-semibold uppercase tracking-wide">Created</h4>
            <span class="">{renderDate(result().response!.data.application.create_date)}</span>
          </div>

          <div class="text-sm">
            <h4 class="font-semibold uppercase tracking-wide">Company</h4>
            <span class="">{result().response!.data.application.company}</span>
          </div>

          <div class="text-sm">
            <h4 class="font-semibold uppercase tracking-wide">Homepage</h4>
            <a href={result().response!.data.application.homepage} target="_blank" class="">
              {result().response!.data.application.homepage}
            </a>
          </div>

          <div class="text-sm">
            <h4 class="font-semibold uppercase tracking-wide">Job post</h4>
            <a href={result().response!.data.application.link} target="_blank" class="">
              {result().response!.data.application.link}
            </a>
          </div>
        </div>
      </section>
      <Documents application={result().response!.data.application} onUpdate={() => { }} />
      <Tags data={result().response?.data.skills || []} onUpdate={updateTags} />
      <Actions actions={result().response?.data.actions || []} />
    </div>
  )
}

export default applicationRoute
