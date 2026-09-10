import { createRoute } from "@tanstack/solid-router"
import ApplicationLayout from "./layouts/application"
import { DELETE, GET } from "../utils/api"
import type { TSavedApplication } from "../models/models"
import { createSignal, For } from "solid-js"
import { DeleteConfirmationDialog } from "../components/alert-dialog"
import PageHeading from "../components/page-heading"
import { renderDate } from "../utils/date"
import { IconLink } from "../components/elements/button"
import Badge from "../components/elements/badge"

type Application = Pick<TSavedApplication, "id" | "name" | "company" | "status" | "create_date">

const applicationsRoute = createRoute({
  getParentRoute: () => ApplicationLayout,
  path: '/',
  component: Applications,
  loader: () => GET<Array<Application>>("/applications", null)
})

function Applications() {
  const applications = applicationsRoute.useLoaderData()

  return (
    <div class="flex flex-col gap-3">
      <PageHeading title="Applications" />
      <ApplicationsList items={applications().response!.data} />
    </div>
  )
}

type ApplicationsListProps = {
  items: Array<Application>
}
function ApplicationsList(props: ApplicationsListProps) {
  const [items, setItems] = createSignal(props.items)

  const handleDelete = async (id: string) => {
    const { error } = await DELETE(`/applications/${id}`, null)
    if (error) {
      console.error("Error occurred while trying to delete entry")
      console.error(error)
      return
    }

    setItems(items().filter((item) => item.id !== id))
  }

  return (
    <div class="ring-1 ring-white/20 rounded-lg overflow-auto">
      <table class="table">
        <thead class="bg-zinc-800">
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody class="bg-zinc-900">
          <For
            each={items()}
            fallback={<tr><td>Empty list</td></tr>}>
            {(item) => (
              <tr>
                <td>
                  <div class="font-medium">{item.name}</div>
                  <div class="text-sm text-muted-foreground">{item.company}</div>
                </td>
                <td>
                  <Badge variant={item.status} label={item.status} />
                </td>
                <td>
                  {renderDate(item.create_date)}
                </td>
                <td class="w-12">
                  <div class="flex gap-2 items-center justify-end">
                    <IconLink icon="ri-eye-fill" label="Show application" size="sm" to="/applications/$applicationId" params={{ applicationId: item.id }} />
                    <DeleteConfirmationDialog id="delete-application"
                      title="Delete entry"
                      description={`You are currently deleting (${item.name}).`}
                      onCancel={() => { }} onConfirmation={() => handleDelete(item.id)} />
                  </div>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

export default applicationsRoute
