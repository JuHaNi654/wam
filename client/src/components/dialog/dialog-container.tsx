import { createPortal } from "react-dom";
import { useDialog } from "@/context/dialog-context";
import { DraggableDialog } from "./draggable-dialog";



export function DialogContainer() {
  return null
  const { dialogs, closeDialog, updatePosition, updateSize, focusDialog } =
    useDialog();

  if (dialogs.length === 0) return null;

  const portalElement = document.body;

  return createPortal(
    <>
      <div style={{ position: "fixed", top: 0, left: 0 }}>
        {dialogs.map((dialog) => (
          <DraggableDialog
            key={dialog.id}
            id={dialog.id}
            title={dialog.title}
            children={dialog.children}
            x={dialog.x}
            y={dialog.y}
            width={dialog.width}
            height={dialog.height}
            zIndex={dialog.zIndex}
            onPositionChange={(x, y) => updatePosition(dialog.id, x, y)}
            onSizeChange={(width, height) => updateSize(dialog.id, width, height)}
            onClose={() => closeDialog(dialog.id)}
            onFocus={() => focusDialog(dialog.id)}
          />
        ))}
      </div>
    </>,
    portalElement
  );
}
