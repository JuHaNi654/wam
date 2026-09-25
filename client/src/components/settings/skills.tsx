import { createResource, Show, For, createSignal } from "solid-js";
import { TSkillExtended } from "../../models/models";
import { DELETE, GET } from "../../utils/api"
import { Button } from "../elements/button";
import { DeleteConfirmationDialog } from "../alert-dialog";
import { useToast } from "../toast";

const fetchSkills = async (page: number) => {
  return await GET<Array<TSkillExtended>>(`/skills?view=extended&page=${page}`, null);
}

export default function Skills() {
  const toast = useToast()
  const [page, setPage] = createSignal<number>(1)
  const [result, { mutate }] = createResource(page, fetchSkills)

  const handleDelete = async (id: string) => {
    const { error } = await DELETE(`/skills/${id}`, null)
    if (error) {
      toast.error({ message: error.message ?? "Something went wrong while trying to delete skill" })
      console.error(error)
      return
    }

    mutate((prev) => {
      if (!prev?.response) return prev

      return {
        ...prev,
        response: {
          ...prev.response,
          data: prev.response.data.filter((skill) => skill.id !== id)
        }
      }
    })
    toast.success({ message: "Skill deleted" })
  }

  return (
    <Show when={result.latest && result.latest!.response}>
      <div
        class="overflow-hidden flex flex-col gap-2 rounded-lg ring-1 ring-white/20 bg-zinc-900 transition-opacity"
        classList={{ "opacity-60 pointer-events-none": result.loading }}
      >
        <header class="flex items-center justify-between bg-zinc-800 p-4">
          <h3 class="text-sm font-semibold uppercase tracking-wide">Skills</h3>
        </header>

        <table class="table table-fixed w-full">
          <thead>
            <tr>
              <th class="w-1/2 text-zinc-500 text-xs uppercase">Name</th>
              <th class="w-1/4 text-zinc-500 text-xs uppercase">In use</th>
              <th class="w-8"></th>
            </tr>
          </thead>
          <tbody>
            <For each={result.latest!.response!.data}>
              {(item) => (
                <tr>
                  <td class="truncate">{item.name}</td>
                  <td class="truncate">{item.in_use}</td>
                  <td class="w-8">
                    <div class="flex justify-end">
                      <DeleteConfirmationDialog id="delete-skill"
                        title="Delete entry"
                        description={`You are currently deleting (${item.name})`}
                        onConfirmation={() => handleDelete(item.id)}
                      />
                    </div>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <div class="inline-grid grid-flow-col auto-cols-fr gap-4 self-center my-5">
          <Button onClick={() => setPage(result.latest!.response!.pagination!.previous)}
            variant="outline" label="Previous"
            disabled={result.loading || page() === result.latest!.response!.pagination!.previous} />
          <Button onClick={() => setPage(result.latest!.response!.pagination!.next)}
            variant="outline" label="Next"
            disabled={result.loading || page() === result.latest!.response!.pagination!.next} />
        </div>
      </div>
    </Show>
  )
}
