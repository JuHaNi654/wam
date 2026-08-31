import { cn } from "@/lib/utils"
import { RiCloseLine } from "@remixicon/react"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react";

const DEFAULT_W = 16 * 40
const DEFAULT_H = 9 * 40

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal(props: ModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragPos = useRef({
    x: window.innerWidth / 2 - DEFAULT_W / 2,
    y: window.innerHeight / 2 - DEFAULT_H / 2
  })

  useEffect(() => {
    if (!modalRef.current) return;

    modalRef.current.addEventListener("mousedown", focusModal)
    document.addEventListener("mousedown", blurModal)

    return () => {
      if (!modalRef.current) return

      document.removeEventListener("mousedown", blurModal)
      modalRef.current.removeEventListener("mousedown", focusModal)
    }
  }, [modalRef.current])

  const focusModal = useRef(() => {
    if (!modalRef.current) return
    modalRef.current.style.zIndex = '40'
  }).current

  const blurModal = useRef((e: any) => {
    if (!e.target || !modalRef.current) return
    const target = e.target as HTMLElement

    if (!modalRef.current.contains(target)) {
      modalRef.current.style.zIndex = ''
    }
  }).current

  const handleMouseUp = useRef(() => {
    setIsDragging(false)
    document.removeEventListener("mousemove", handleMouseMove)
  }).current

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (!modalRef.current) return
    const x = e.clientX - dragOffset.current.x;
    const y = e.clientY - dragOffset.current.y;

    dragPos.current = { x, y }
    modalRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }).current

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = e.target as HTMLElement
    if (target.closest("button")) return;

    dragOffset.current = {
      x: e.clientX - dragPos.current.x,
      y: e.clientY - dragPos.current.y
    }

    setIsDragging(true)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp, { once: true })
  }

  return (
    <div ref={modalRef}
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${dragPos.current.x}px, ${dragPos.current.y}px, 0)`,
        width: DEFAULT_W,
        height: DEFAULT_H
      }}
      className="flex flex-col z-20 fixed border border-border rounded-lg bg-background shadow-lg overflow-hidden">
      <div onMouseDown={handleMouseDown} className={cn(
        "flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40 select-none",
        isDragging && "bg-muted/60 cursor-grabbing",
        !isDragging && "cursor-grab hover:bg-muted/50 transition-colors"
      )}>
        <h2 className="text-sm font-semibold flex-1">{props.title}</h2>
        <button
          onClick={props.onClose}
          className="cursor-pointer inline-flex items-center justify-center w-6 h-6 rounded hover:bg-muted/70 transition-colors/">
          <RiCloseLine size={16} />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-auto">{props.children}</div>
    </div>
  )
}
