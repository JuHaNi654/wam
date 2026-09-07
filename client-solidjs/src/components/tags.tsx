import { For, createUniqueId, createSignal, createResource, createMemo, ErrorBoundary } from "solid-js"
import { TSkill } from "../models/models"
import { GET } from "../utils/api"
import { twMerge } from "tailwind-merge"
import Fuse from 'fuse.js'

type Props = {
  data: Array<TSkill>
}

const fetchSkills = async () => {
  const { response, error } = await GET<Array<TSkill>>('/skills', null);

  if (error) throw error
  return response
}

const checkSelected = (item: TSkill, items: Array<TSkill>) => {
  return items.some((i) => i.id === item.id)
}

export default function Tags(props: Props) {
  const [selectedTags, setSelectedTags] = createSignal(props.data)
  const [data] = createResource(true, fetchSkills)
  const [query, setQuery] = createSignal("")
  const [showPopover, setShowpopover] = createSignal(false)

  let toolbarRef!: HTMLDivElement
  let popoverRef!: HTMLDivElement
  let inputRef!: HTMLInputElement
  const popoverId = `tags-popover-${createUniqueId()}`

  const filteredItems = createMemo(() => {
    if (!data()) return []

    const fuse = new Fuse(data()!.data, {
      keys: ['name'],
      threshold: 0.2
    })

    return fuse.search(query())
  })

  const handleFocus = () => {
    inputRef.focus()
    setShowpopover(true)
  }

  const handleBlur = () => {
    // setShowpopover(false)
  }

  const handleInput = (e: InputEvent) => {
    if (!showPopover()) setShowpopover(true)
    const target = e.target as HTMLInputElement
    setQuery(target.value)
  }

  const removeSelcted = (item: TSkill) => {
    const filteredList = selectedTags().filter((tag) => tag !== item)
    setSelectedTags(filteredList)
  }

  const toggleSelected = (e: MouseEvent, item: TSkill) => {
    const target = e.target as HTMLDivElement
    const isTargetSelected = target.getAttribute("aria-selected") === "true"
    const selected = selectedTags()

    if (!isTargetSelected) {
      setSelectedTags([...selected, item])
      target.setAttribute("aria-selected", "true")
      return
    }

    const newList = selected.filter((tag) => tag.id !== item.id)
    target.setAttribute("aria-selected", "false")
    setSelectedTags(newList)
  }


  return (
    <div class="flex flex-col gap-2 ring-1 ring-white/20 bg-zinc-800 rounded-lg p-4">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide">Skills</h3>
      </header>
      <div role="toolbar" ref={toolbarRef}
        onClick={handleFocus}
        style={`anchor-name:--${popoverId}`}
        class="flex flex-wrap gap-2 ring-1 ring-white/20 p-3 rounded-lg bg-zinc-950">
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
          onBlur={handleBlur} onInput={handleInput}
          class="h-auto text-xs flex-1 min-w-1/2 w-full" placeholder="Add a skill" />
      </div>
      <div ref={popoverRef} role="listbox" aria-multiselectable="true"
        style={`width: anchor-size(width); position-anchor:--${popoverId}; top: anchor(--${popoverId} bottom); left: anchor(left);`}
        class={`overflow-scroll rounded-t-sm rounded-b-xl fixed h-50 bg-zinc-800 ring-1 ring-white/20 ${showPopover() ? 'block' : 'hidden'}`}>
        <ErrorBoundary fallback={<div>Error loading data</div>}>
          <For each={filteredItems()}>
            {(item) => {
              const selected = checkSelected(item.item, selectedTags())

              return (
                <div aria-selected={selected} role="option" onClick={(e) => toggleSelected(e, item.item)}
                  class={twMerge(
                    "text-sm px-3 py-2 hover:bg-zinc-400/10 focus:bg-zinc-400/10 hover:text-white focus:text-white cursor-pointer",
                  )}>
                  {item.item.name}
                </div>
              )
            }}
          </For>
        </ErrorBoundary>
      </div>
    </div>
  )
}
