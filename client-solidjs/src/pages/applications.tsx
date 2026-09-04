import { createRoute } from "@tanstack/solid-router"
import ApplicationLayout from "./layouts/application"
import { GET } from "../utils/api"
import type { TSavedApplication } from "../models/models"
import { For } from "solid-js"
import { Link } from "@tanstack/solid-router"
import { DeleteConfirmationDialog } from "../components/alert-dialog"
import PageHeading from "../components/page-heading"

type Application = Pick<TSavedApplication, "id" | "name" | "company" | "status" | "create_date">

const applicationsRoute = createRoute({
  getParentRoute: () => ApplicationLayout,
  path: '/',
  component: Applications,
  loader: () => GET<Array<Application>>("/applications", null)
})

function Applications() {
  const applications = applicationsRoute.useLoaderData()

  const handleDelete = async (id: string) => {
    console.log("Id: ", id)
  }

  return (
    <div>
      <PageHeading title="Applications" />
      <div class="border border-gray-200 rounded-lg overflow-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <For
              each={applications().response!.data}
              fallback={<tr><td>Empty list</td></tr>}>
              {(item) => (
                <tr>
                  <td>
                    <div class="font-medium">{item.name}</div>
                    <div class="text-sm text-muted-foreground">{item.company}</div>
                  </td>
                  <td>
                    {item.status}
                  </td>
                  <td>
                    {item.create_date}
                  </td>
                  <td>
                    <div class="flex gap-2 justify-end">
                      <Link class="btn btn-soft" to="/applications/$applicationId" params={{ applicationId: item.id }}>
                        <i class="ri-eye-fill"></i>
                      </Link>
                      <DeleteConfirmationDialog id="delete-application"
                        title="Are you sure, you want to delete selected item"
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
    </div>
  )
}

export default applicationsRoute
