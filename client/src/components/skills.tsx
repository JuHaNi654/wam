import { For, createUniqueId, createSignal, createResource, createMemo, ErrorBoundary, onMount, onCleanup, Show } from "solid-js"
import { TSkill } from "../models/models"
import { GET, POST } from "../utils/api"
import { twMerge } from "tailwind-merge"
import Fuse from 'fuse.js'
import { useToast } from "./toast"

type Props = {
  data: Array<TSkill>
  onUpdate?: (items: Array<TSkill>) => void
}

const fetchSkills = async () => {
  return await GET<Array<TSkill>>('/skills', null);
}

const checkSelected = (item: TSkill, items: Array<TSkill>) => {
  return items.some((i) => i.id === item.id)
}

export default function Tags(props: Props) {
  const toast = useToast()
  const [selectedTags, setSelectedTags] = createSignal(props.data)
  const [result, { mutate }] = createResource(true, fetchSkills)
  const [query, setQuery] = createSignal("")
  const [showPopover, setShowpopover] = createSignal(false)

  const popoverId = `tags-popover-${createUniqueId()}`
  let toolbarRef!: HTMLDivElement
  let inputRef!: HTMLInputElement
  let popoverRef!: HTMLDivElement

  const createNewSkill = async () => {
    const result = await POST<TSkill>('/skills', { name: query() })
    if (result.error) {
      console.error(result.error)
      toast.error({ message: "error occured while trying to create new skill tag" })
      return
    }

    mutate((prev) => {
      if (!prev || !prev.response) return prev
      return { ...prev, response: { ...prev.response, data: [...prev.response.data, result.response!.data] } }
    })
    setSelectedTags((prev) => [...prev, result.response!.data])
    if (props.onUpdate) props.onUpdate(selectedTags())
  }

  const handleMouseDown = (e: MouseEvent) => {
    if (e.target !== inputRef) e.preventDefault()
    inputRef.focus()
    setShowpopover(true)
  }

  const handleBlur = () => {
    setShowpopover(false)
  }

  const handleInput = (e: InputEvent) => {
    if (!showPopover()) setShowpopover(true)
    const target = e.target as HTMLInputElement
    setQuery(target.value)
  }

  const removeSelcted = (item: TSkill) => {
    const filteredList = selectedTags().filter((tag) => tag !== item)
    setSelectedTags(filteredList)
    if (props.onUpdate) props.onUpdate(filteredList)
  }

  const toggleSelected = (item: TSkill) => {
    const selected = selectedTags()
    setQuery("")

    if (!checkSelected(item, selected)) {
      setSelectedTags([...selected, item])
      if (props.onUpdate) props.onUpdate(selectedTags())
      return
    }

    setSelectedTags(selected.filter((tag) => tag.id !== item.id))
    if (props.onUpdate) props.onUpdate(selectedTags())
  }


  const filteredItems = createMemo(() => {
    if (!result()?.response?.data) return []

    const fuse = new Fuse(result()!.response!.data, {
      keys: ['name'],
      threshold: 0.2
    })

    return fuse.search(query())
  })

  const handleKeydown = (e: KeyboardEvent) => {
    if (!showPopover()) return

    switch (e.key) {
      case "Escape":
        e.preventDefault()
        setShowpopover(false)
        break
      case "Backspace":
        if (inputRef.value.length !== 0) return

        setSelectedTags((prev) => {
          prev.pop()
          return [...prev]
        })

        break
      default:
        break
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown)
  })

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeydown)
  })

  return (
    <Show when={result() && result()!.response}>
      <div class="flex flex-col gap-2 ring-1 ring-white/20 bg-zinc-800 rounded-lg p-4">
        <header class="flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase tracking-wide">Skills</h3>
        </header>
        <div onMouseDown={handleMouseDown}>
          <div role="toolbar" ref={toolbarRef}
            style={`anchor-name:--${popoverId}`}
            class="flex flex-wrap gap-2 ring-1 ring-white/20 p-3 rounded-md bg-zinc-950 focus-within:ring-2 focus-within:ring-emerald-500">

            <For each={selectedTags()}>
              {(item) => (
                <div class="text-xs px-3 py-1 ring-1 flex gap-2 rounded">
                  <span>{item.name}</span>
                  <button onClick={() => removeSelcted(item)} class="aspect-square cursor-pointer">
                    <i class="ri-close-large-line"></i>
                  </button>
                </div>
              )}
            </For>

            <input type="text" id="tag-input" name="tag-input" ref={inputRef}
              onInput={handleInput} value={query()} onBlur={handleBlur}
              class="h-auto text-xs flex-1 min-w-1/2 w-full outline-none" placeholder="Add a skill" />
          </div>
          <div ref={popoverRef} role="listbox" aria-multiselectable="true"
            style={`width: anchor-size(width); position-anchor:--${popoverId}; top: anchor(--${popoverId} bottom); left: anchor(left);`}
            class={`z-50 overflow-scroll rounded-t-sm rounded-b-xl fixed min-h-10 max-h-50 bg-zinc-800 ring-1 ring-white/20 ${showPopover() ? 'block' : 'hidden'}`}>

            <Show when={filteredItems().length > 0} fallback={(
              <div role="option" tabIndex={-1} onClick={createNewSkill}
                class={twMerge(
                  "text-sm px-3 py-2 hover:bg-zinc-400/10 focus:bg-zinc-400/10 hover:text-white focus:text-white cursor-pointer",
                )}>
                Create ({query()}) skill
              </div>
            )}>
              <For each={filteredItems()}>
                {(item) => {
                  const selected = checkSelected(item.item, selectedTags())

                  return (
                    <div aria-selected={selected} role="option" tabIndex={-1} onClick={() => toggleSelected(item.item)}
                      class={twMerge(
                        "text-sm px-3 py-2 hover:bg-zinc-400/10 focus:bg-zinc-400/10 hover:text-white focus:text-white cursor-pointer",
                      )}>
                      {item.item.name}
                    </div>
                  )
                }}
              </For>
            </Show>

          </div>
        </div>
      </div>
    </Show>
  )
}
