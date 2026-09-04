import type { JSX } from "solid-js";
import { createSignal, onCleanup, onMount } from "solid-js";
import { twMerge } from "tailwind-merge"
import { IconButton } from "./elements/button";

const DEFAULT_W = 16 * 40
const DEFAULT_H = 9 * 60

type Props = {
  subTitle?: string;
  title: string;
  children: JSX.Element;
  onClose: () => void;
  footer?: JSX.Element;
}

export function Modal(props: Props) {
  const [isDragging, setIsDragging] = createSignal(false);
  const dragOffset = { x: 0, y: 0 }
  const dragPos = {
    x: (window.innerWidth - DEFAULT_W) / 2,
    y: (window.innerHeight - DEFAULT_H) / 2
  }

  let modalRef!: HTMLDivElement

  const focusModal = () => {
    if (!modalRef) return
    modalRef.style.zIndex = '40'

    modalRef.style.setProperty("--drag-position-x", `${dragPos.x}px`)
    modalRef.style.setProperty("--drag-position-y", `${dragPos.y}px`)
  }

  const blurModal = (e: MouseEvent) => {
    if (!e.target || !modalRef) return
    const target = e.target as HTMLElement

    if (!modalRef.contains(target)) {
      modalRef.style.zIndex = ''
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!modalRef) return
    dragPos.x = e.clientX - dragOffset.x
    dragPos.y = e.clientY - dragOffset.y

    modalRef.style.setProperty("--drag-position-x", `${dragPos.x}px`)
    modalRef.style.setProperty("--drag-position-y", `${dragPos.y}px`)
    modalRef.style.transform = `translate3d(${dragPos.x}px, ${dragPos.y}px, 0)`
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.removeEventListener("mousemove", handleMouseMove)
  }

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    const target = e.target as HTMLElement
    if (target.closest("button")) return;

    dragOffset.x = e.clientX - dragPos.x
    dragOffset.y = e.clientY - dragPos.y

    setIsDragging(true)

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp, { once: true })
  }

  onMount(() => {
    modalRef.addEventListener("mousedown", focusModal)
    document.addEventListener("mousedown", blurModal)
  })

  onCleanup(() => {
    modalRef.removeEventListener("mousedown", focusModal)
    document.removeEventListener("mousedown", blurModal)
  })

  return (
    <div ref={modalRef}
      style={{
        left: 0, top: 0,
        width: `${DEFAULT_W}px`,
        height: `${DEFAULT_H}px`,
        transform: `translate3d(${dragPos.x}px, ${dragPos.y}px, 0)`
      }}
      class="bg-zinc-800 ring-1 ring-white/10 flex flex-col z-20 fixed rounded-xl overflow-hidden">
      <header onMouseDown={handleMouseDown}
        class={twMerge(
          "flex items-center justify-start px-4 py-4 border-b border-white/10 bg-muted/40 select-none",
          isDragging() ? "cursor-grabbing" : "cursor-grab"
        )}>

        <i class="ri-draggable text-2xl text-zinc-500"></i>
        <div class="flex flex-col ml-2 mr-auto">
          {props.subTitle && <span class="block text-xs font-semibold text-zinc-500">{props.subTitle}</span>}
          <h2 class="text-md uppercase font-display font-semibold flex-1">{props.title}</h2>
        </div>
        <IconButton size="md" label="close" onClick={props.onClose} icon="ri-close-line" />
      </header>
      <div class="flex-1 p-4 overflow-auto">{props.children}</div>
      {props.footer && props.footer}
    </div>
  )
}

type ModalFooterProps = {
  children: JSX.Element;
}
export function ModalFooter(props: ModalFooterProps) {
  return (
    <footer class="bg-zinc-900 flex justify-end gap-4 py-4 px-6 border-t border-white/10">
      {props.children}
    </footer>
  )
}
