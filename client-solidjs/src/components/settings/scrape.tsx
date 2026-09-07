import { For, createSignal } from "solid-js"
import { TScrapeTarget } from "../../models/models"
import { POST } from "../../utils/api"

type Props = {
  items: Array<TScrapeTarget>
}
export default function ScrapeTargetListing(props: Props) {
  const [items, setItems] = createSignal<Array<TScrapeTarget>>(props.items)

  const save = async () => {
    const result = await POST(`/settings`, {
      targets: items()
    })

    if (result.error) {
      console.error("error occurred while saving scrape targets")
      console.error(result.error)
      return
    }

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
    <div class="flex flex-col gap-2 border rounded-lg border-gray-200 p-4">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide">Website scrape targets</h3>
        <button onClick={() => save()} class="btn btn-soft">
          <i class="ri-save-line"></i>
        </button>
      </header>
      <table class="table">
        <thead>
          <tr>
            <th>Website</th>
            <th>Target class (CSS)</th>
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
                <td>
                  <div class="flex justify-end">
                    <button onClick={() => deleteItem(idx())} class="btn btn-soft">
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </For>
          <tr>
            <td colspan={3}>
              <div class="text-center my-2">
                <button class="btn btn-soft" onClick={() => newItem()}>New</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
