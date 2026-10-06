import { createRoute } from "@tanstack/solid-router"
import ApplicationLayout from "./layouts/application"
import { GET, PUT, POST } from "../utils/api"
import { ApplicationStatus, TSavedAction, TSavedApplication, TSkill, TSkillExtended, TSKilLSearch } from "../models/models"
import { renderDate } from "../utils/date"
import Documents from "../components/documents"
import Skills from "../components/skills"
import Actions from "../components/actions"
import SelectField from "../components/input/SelectField"
import { useToast } from "../components/toast"
import { Button, IconButton } from "../components/elements/button"
import { createSignal, For, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { Modal, ModalFooter } from "../components/modal"

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
      <Skills data={result().response?.data.skills || []} onUpdate={updateTags}>
        <header class="flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase tracking-wide">Skills</h3>
          <AISkill applicationID={result().response!.data.application.id} />
        </header>
      </Skills>
      <Actions actions={result().response?.data.actions || []} />
    </div>
  )
}

type AISkillProps = {
  applicationID: string;
}

function AISkill(props: AISkillProps) {
  const toast = useToast()
  const [showModal, setshowModal] = createSignal(false)
  const [tags, setTags] = createSignal<Array<TSKilLSearch>>([])
  const [loading, setLoading] = createSignal(false)

  const generate = async () => {
    setLoading(true)
    const result = await GET<Array<TSKilLSearch>>(`/llm/flow/hardskill?applicationId=${props.applicationID}`, null)
    setLoading(false)
    if (result.error) {
      console.error(result.error)
      toast.error({ message: "Something went wrong while trying to generate skills" })
      return
    }

    setTags(() => result.response!.data)
  }


  return (
    <>
      <IconButton icon="ri-ai" label="AI skills popup" size="sm" onClick={() => setshowModal(true)} />
      <Show when={showModal()}>
        <Portal>
          <Modal subTitle="AI" title="Generate skills"
            onClose={() => setshowModal(false)}
            footer={(
              <ModalFooter>
                <Button onClick={generate} variant="outline" label="Generate" loading={loading()} disabled={loading()} />
              </ModalFooter>
            )}>
            <div class="flex flex-wrap gap-2 ring-1 ring-white/20 p-3 rounded-md bg-zinc-950">
              <For each={tags()}>
                {(item) => (
                  <div class="text-xs px-3 py-1 ring-1 flex gap-2 rounded">
                    <span>{item.name}</span>
                  </div>
                )}
              </For>
            </div>
          </Modal>
        </Portal>
      </Show>
    </>
  )
}

export default applicationRoute
