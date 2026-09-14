import { For, createUniqueId, createSignal, createResource, createMemo, ErrorBoundary, onMount, onCleanup } from "solid-js"
import { TSkill } from "../models/models"
import { GET } from "../utils/api"
import { twMerge } from "tailwind-merge"
import Fuse from 'fuse.js'

type Props = {
  data: Array<TSkill>
  onUpdate?: (items: Array<TSkill>) => void
}

// https://www.solidjs.com/tutorial/bindings_directives

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

  const closePopover = () => {
    setShowpopover(false)
    setQuery("")
    inputRef.value = ""
  }

  // Only mousedowns that land outside both the toolbar and the popover
  // should close the popover. Mousedown/click on either of those areas is
  // handled by the guarded onMouseDown handlers below, which stop the
  // browser from blurring the input in the first place.
  const handleOutsideMouseDown = (e: MouseEvent) => {
    const target = e.target as Node
    if (toolbarRef.contains(target) || popoverRef.contains(target)) return
    closePopover()
  }

  onMount(() => {
    document.addEventListener("mousedown", handleOutsideMouseDown)
  })

  onCleanup(() => {
    document.removeEventListener("mousedown", handleOutsideMouseDown)
  })

  // Prevents the input from losing focus when the user mousedowns on the
  // toolbar (e.g. a remove-tag button), while still allowing native
  // mousedown behavior (caret placement, text selection) when the
  // mousedown target is the input itself.
  const handleToolbarMouseDown = (e: MouseEvent) => {
    if (e.target !== inputRef) e.preventDefault()
  }

  // Prevents the input from losing focus when the user mousedowns on a
  // popover option, so selecting a skill doesn't blur/close things first.
  const handlePopoverMouseDown = (e: MouseEvent) => {
    e.preventDefault()
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

    if (!checkSelected(item, selected)) {
      setSelectedTags([...selected, item])
      if (props.onUpdate) props.onUpdate(selectedTags())
      return
    }

    setSelectedTags(selected.filter((tag) => tag.id !== item.id))
    if (props.onUpdate) props.onUpdate(selectedTags())
  }

  const handleKeydown = (e: KeyboardEvent) => {
    console.log("KeyDownEvent: ", e)
    console.log("Value: ", inputRef.value)
    switch (e.key) {
      case "Escape":
        console.log("Escape")
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
    <div class="flex flex-col gap-2 ring-1 ring-white/20 bg-zinc-800 rounded-lg p-4">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide">Skills</h3>
      </header>
      <div role="toolbar" ref={toolbarRef}
        onClick={handleFocus}
        onMouseDown={handleToolbarMouseDown}
        style={`anchor-name:--${popoverId}`}
        class="flex flex-wrap gap-2 ring-1 ring-white/20 p-3 rounded-lg bg-zinc-950 focus-within:ring-2 focus-within:ring-emerald-500">
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
          onInput={handleInput}
          class="h-auto text-xs flex-1 min-w-1/2 w-full outline-none" placeholder="Add a skill" />
      </div>
      <div ref={popoverRef} role="listbox" aria-multiselectable="true"
        onMouseDown={handlePopoverMouseDown}
        style={`width: anchor-size(width); position-anchor:--${popoverId}; top: anchor(--${popoverId} bottom); left: anchor(left);`}
        class={`z-50 overflow-scroll rounded-t-sm rounded-b-xl fixed max-h-50 bg-zinc-800 ring-1 ring-white/20 ${showPopover() ? 'block' : 'hidden'}`}>
        <ErrorBoundary fallback={<div>Error loading data</div>}>
          <For each={filteredItems()}>
            {(item) => {
              const selected = checkSelected(item.item, selectedTags())

              return (
                <div aria-selected={selected} role="option" onClick={() => toggleSelected(item.item)}
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
