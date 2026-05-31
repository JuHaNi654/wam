import { Button } from "../ui/button"
import { useDialog } from "@/context/dialog-context"
import { RiEyeLine } from "@remixicon/react";
import { renderDate } from "@/lib/date";
import ActionForm from "../form/action";
import { UpdateActionForm } from "../form/action";
import type { Action, SavedAction } from "../form/action";
import { useState } from "react";

type Props = {
  applicationId: string,
  actions: SavedAction[]
}

export default function Actions(props: Props) {
  const { openDialog, closeDialog } = useDialog()
  const [actions, setActions] = useState<SavedAction[]>(props.actions)

  const handleUpdate = (actionId: string, action: Action) => {
    const tmp = actions
    for (let i = 0; i < tmp.length; i++) {
      if (tmp[i].id === actionId) {
        Object.assign(tmp[i], action)
      }
    }

    setActions(tmp)
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
                onSubmit={() => closeDialog("new-action-dialog")}
                onCancel={() => closeDialog("new-action-dialog")}
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
            <div key={action.id} className="flex gap-4 text-sm border-l-2 border-border pl-4">
              <div className="shrink-0 text-muted-foreground w-24">
                {renderDate(action.date)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{action.title}</p>

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
