import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { RiCloseLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

interface DraggableDialogProps {
  id: string;
  title: string;
  children: ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  onPositionChange: (x: number, y: number) => void;
  onSizeChange: (width: number, height: number) => void;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
}

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;

export function DraggableDialog(props: DraggableDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0, y: 0,
    width: props.width,
    height: props.height
  });

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    props.onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - props.x,
      y: e.clientY - props.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent,) => {
    e.preventDefault();
    props.onFocus();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: props.width,
      height: props.height,
    });
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, e.clientX - dragOffset.x);
        const newY = Math.max(0, e.clientY - dragOffset.y);
        props.onPositionChange(newX, newY);
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        let newWidth = Math.max(MIN_WIDTH, resizeStart.width + deltaX);
        let newHeight = Math.max(MIN_HEIGHT, resizeStart.height + deltaY);
        props.onSizeChange(newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  return (
    <div
      ref={dialogRef}
      className="fixed border border-border rounded-lg bg-background shadow-lg overflow-hidden"
      style={{
        left: `${props.x}px`,
        top: `${props.y}px`,
        width: `${props.width}px`,
        height: `${props.height}px`,
        zIndex: 3,
      }}
    >
      {/* Title bar - draggable */}
      <div
        className={cn(
          "flex items-center justify-between p-3 border-b border-border bg-muted/40 select-none",
          isDragging && "bg-muted/60 cursor-grabbing",
          !isDragging && "cursor-move cursor-grab hover:bg-muted/50 transition-colors"
        )}
        onMouseDown={handleTitleMouseDown}
      >
        <h2 className="text-sm font-semibold flex-1">{props.title}</h2>
        <button
          onClick={props.onClose}
          className="cursor-pointer inline-flex items-center justify-center w-6 h-6 rounded hover:bg-muted/70 transition-colors"
          aria-label="Close dialog"
        >
          <RiCloseLine size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto" style={{ height: `${props.height - 44}px` }}>
        {props.children}
      </div>

      {/* Resize handles */}
      <button onMouseDown={(e) => handleResizeMouseDown(e)}
        className="absolute bg-border/50 hover:bg-primary/50 transition-colors bottom-0 right-0 w-2 h-2 cursor-nwse-resize"
      />
    </div>
  );
}
