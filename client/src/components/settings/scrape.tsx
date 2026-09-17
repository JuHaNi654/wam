import { For, createSignal } from "solid-js"
import { TScrapeTarget } from "../../models/models"
import { POST } from "../../utils/api"
import { Button, IconButton } from "../elements/button"
import { useToast } from "../toast"

type Props = {
  items: Array<TScrapeTarget>
}
export default function ScrapeTargetListing(props: Props) {
  const toast = useToast()
  const [items, setItems] = createSignal<Array<TScrapeTarget>>(props.items)

  const save = async () => {
    const result = await POST(`/settings`, {
      targets: items()
    })

    if (result.error) {
      toast.error({ message: "Error occurred whiel trying to save settings" })
      console.error(result.error)
      return
    }

    toast.success({ message: "Settings updated" })
  }

  const updateListItem = (e: Event, idx: number) => {
    const target = e.target as HTMLInputElement
    const name = target.name as keyof TScrapeTarget
    const value = target.value

    setItems(items().map((item, i) => (
      i === idx ? { ...item, [name]: value } : item
    )))
  }

  const deleteItem = (idx: number) => {
    const filtered = items().filter((_, i) => i !== idx)
    setItems(filtered)
  }

  const newItem = () => {
    setItems([...items(), { url: "", class: "" }])
  }

  return (
    <div class="overflow-hidden flex flex-col gap-2 rounded-lg ring-1 ring-white/20 bg-zinc-900">
      <header class="flex items-center justify-between bg-zinc-800 p-4">
        <h3 class="text-sm font-semibold uppercase tracking-wide">Website scrape targets</h3>
        <IconButton icon="ri-save-line" label="Save settings" size="sm" onClick={() => save()} />
      </header>
      <table class="table">
        <thead>
          <tr>
            <th class="text-zinc-500 text-xs uppercase">Website</th>
            <th class="text-zinc-500 text-xs uppercase">Target class (CSS)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <For each={items()}>
            {(item, idx) => (
              <tr>
                <td>
                  <input onChange={(e) => updateListItem(e, idx())}
                    type="text" id="url" name="url" class="input w-full" value={item.url} />
                </td>
                <td>
                  <input onChange={(e) => updateListItem(e, idx())}
                    type="text" id="class" name="class" class="input w-full" value={item.class} />
                </td>
                <td class="w-8">
                  <div class="flex justify-end">
                    <IconButton icon="ri-delete-bin-line" label="Delete item" size="sm" onClick={() => deleteItem(idx())} />
                  </div>
                </td>
              </tr>
            )}
          </For>
          <tr>
            <td colspan={3}>
              <div class="flex justify-center my-2">
                <Button label="New" onClick={newItem} variant="primary" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
