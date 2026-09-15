import { createRoute } from "@tanstack/solid-router"
import ApplicationLayout from "./layouts/application"
import { GET, PUT, POST } from "../utils/api"
import { ApplicationStatus, TSavedAction, TSavedApplication, TSkill } from "../models/models"
import { renderDate } from "../utils/date"
import Documents from "../components/documents"
import Tags from "../components/skills"
import Actions from "../components/actions"
import SelectField from "../components/input/SelectField"
import { useToast } from "../components/toast"

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
  const toast = useToast()
  const result = applicationRoute.useLoaderData()

  const updateTags = async (tags: Array<TSkill>) => {
    const { error } = await POST(`/applications/${result().response!.data.application.id}/skills`, { skills: tags })
    if (error) {
      toast.error({ message: "Error occured while trying to save skills" })
      console.error(error)
      return
    }

    toast.success({ message: "Skills updated" })
  }

  const handleUpdate = async (item: { [k: string]: any }) => {
    const { error } = await PUT(`/applications/${result().response!.data.application.id}`, item)
    if (error) {
      toast.error({ message: "Error while trying to update application information" })
      console.error(error)
      return
    }

    toast.success({ message: "Application updated" })
  }

  return (
    <div class="flex flex-col gap-3">

      <header class="py-4 font-semibold flex justify-between items-center">
        <h1 class="font-display uppercase leading-[0.94] text-4xl">{result().response!.data.application.name}</h1>

        <SelectField class="w-max" name="status" value={result().response!.data.application.status} aria-label="Status"
          onInput={(e) => handleUpdate({ status: e.currentTarget.value })}>
          <option value={ApplicationStatus.Saved}>Saved</option>
          <option value={ApplicationStatus.Applied}>Applied</option>
          <option value={ApplicationStatus.Interviewing}>Interviewing</option>
          <option value={ApplicationStatus.Offered}>Offered</option>
          <option value={ApplicationStatus.Rejected}>Rejected</option>
          <option value={ApplicationStatus.Withdrawn}>Withdrawn</option>
        </SelectField>
      </header>
      <section class="flex flex-col gap-2 ring-1 ring-white/20 bg-zinc-800 rounded-lg p-4">
        <header class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold uppercase tracking-wide">Details</h3>

        </header>
        <div class="flex flex-col gap-2">
          <div class="text-sm">
            <h4 class="font-semibold tracking-wide">Created</h4>
            <span class="text-sm font-semibold text-zinc-500">{renderDate(result().response!.data.application.create_date)}</span>
          </div>

          <div class="text-sm">
            <h4 class="font-semibold uppercase tracking-wide">Company</h4>
            <span class="text-sm font-semibold text-zinc-500">{result().response!.data.application.company}</span>
          </div>

          <div class="text-sm">
            <h4 class="font-semibold uppercase tracking-wide">Homepage</h4>
            <a href={result().response!.data.application.homepage} target="_blank" class="text-sm font-semibold text-zinc-500 hover:text-blue-500">
              {result().response!.data.application.homepage}
            </a>
          </div>

          <div class="text-sm">
            <h4 class="font-semibold uppercase tracking-wide">Job post</h4>
            <a href={result().response!.data.application.link} target="_blank" class="text-sm font-semibold text-zinc-500 hover:text-blue-500">
              {result().response!.data.application.link}
            </a>
          </div>
        </div>
      </section>
      <Documents application={result().response!.data.application} onUpdate={handleUpdate} />
      <Tags data={result().response?.data.skills || []} onUpdate={updateTags} />
      <Actions actions={result().response?.data.actions || []} />
    </div>
  )
}

export default applicationRoute
