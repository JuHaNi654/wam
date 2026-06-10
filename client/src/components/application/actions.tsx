import { Button } from "../ui/button"
import { useDialog } from "@/context/dialog-context"
import { RiEyeLine } from "@remixicon/react";
import { renderDate } from "@/lib/date";
import ActionForm from "../form/action";
import { UpdateActionForm } from "../form/action";
import type { Action, SavedAction } from "../form/action";
import { useState } from "react";
import { DeleteConfirmationDialog } from "../dialog/alert-dialog";
import { DELETE } from "@/lib/api";
import { toast } from "sonner"

type Props = {
  applicationId: string,
  actions: SavedAction[]
}

export default function Actions(props: Props) {
  const { openDialog, closeDialog } = useDialog()
  const [actions, setActions] = useState<SavedAction[]>(props.actions)

  const handleUpdate = (actionId: string, action: Action) => {
    setActions((prev) =>
      prev.map((item) => (item.id === actionId ? { ...item, ...action } : item))
    )
  }

  const handleDelete = async (id: string) => {
    try {
      await DELETE(`/api/actions/${id}`)
      setActions((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      console.error(err)
      toast.error("Something went wrong while trying to delete action", { position: "bottom-right" })
    }
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Actions</h3>
        <Button variant="outline" size="sm" onClick={() => {
          openDialog({
            id: "new-action-dialog",
            title: "New action",
            children: (
              <ActionForm applicationId={props.applicationId}
                onCancel={() => closeDialog("new-action-dialog")}
                onSubmit={(data: SavedAction) => {
                  setActions((prev) => [...prev, data])
                  closeDialog("new-action-dialog")
                }}
              />
            ),
            width: 420,
            height: 380
          })
        }}>
          + Add Action
        </Button>
      </div>

      {actions.length === 0 && (
        <p className="text-sm text-muted-foreground">No actions recorded yet.</p>
      )}

      {actions.length > 0 && (
        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.id} className="flex gap-4 items-center text-sm border-l-2 border-border pl-4">
              <div className="shrink-0 text-muted-foreground">
                {renderDate(action.date)}
              </div>
              <p className="flex-1 font-medium">{action.title}</p>
              <div className="">
                <Button type="button" variant="ghost"
                  size="icon-sm"
                  aria-label="View action"
                  className="shrink-0 cursor-pointer"
                  onClick={() => {
                    openDialog({
                      id: action.id,
                      title: action.title,
                      children: <UpdateActionForm onSave={handleUpdate} action={action} />,
                      width: 520,
                      height: 560,
                    })
                  }}
                >
                  <RiEyeLine />
                </Button>

                <DeleteConfirmationDialog buttonLabel="Delete action"
                  title="Are you sure, you want to delete selected item"
                  description={`You are currently deleting (${action.title}).`}
                  onConfirmation={() => handleDelete(action.id)}
                />

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
