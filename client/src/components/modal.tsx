import { cn } from "@/lib/utils"
import { RiCloseLine } from "@remixicon/react"
import { useEffect, useRef, useState } from "react"


const DEFAULT_W = 16 * 40
const DEFAULT_H = 9 * 40

type ModalProps = {
  onClose: () => void
}

export default function Modal(props: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false)
  const [dragPos, setDragPos] = useState({
    x: window.innerWidth / 2 - DEFAULT_W / 2,
    y: window.innerHeight / 2 - DEFAULT_H / 2
  })
  const [style, setStyle] = useState({
    left: 0,
    top: 0,
    transform: `translate3d(${dragPos.x}px, ${dragPos.y}px, 0)`,
    width: DEFAULT_W,
    height: DEFAULT_H
  })

  const handleMouseUp = () => {
    console.log("handleMouseUp")
    setIsDragging(false)
    document.removeEventListener("mousemove", handleMouseMove)
  }

  const handleMouseMove = (e: MouseEvent) => {
    console.log("handleMouseMove")
    console.log(e.clientX, e.clientY)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button")) return;

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp, { once: true })
    console.log("Drag modal")
  }

  return (
    <div style={style} ref={modalRef}
      className="z-20 fixed border border-border rounded-lg bg-background shadow-lg overflow-hidden">
      <div onMouseDown={handleMouseDown} className={cn(
        "flex items-center justify-between p-3 border-b border-border bg-muted/40 select-none",
        isDragging && "bg-muted/60 cursor-grapping",
        !isDragging && "cursor-grab hover:bg-muted/50 transition-colors"
      )}>
        <h2 className="text-sm font-semibold flex1">Placeholder</h2>
        <button
          onClick={props.onClose}
          className="cursor-pointer inline-flex items-center justify-center w-6 h-6 rounded hover:bg-muted/70 transition-colors/">
          <RiCloseLine size={16} />
        </button>
      </div>
    </div>
  )
}
