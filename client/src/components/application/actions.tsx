import type { Action } from "@/types/api.types"
import { Button } from "../ui/button"
import { useDialog } from "@/context/dialog-context"
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { POST } from "@/lib/api";
import { RiEyeLine } from "@remixicon/react";
import { renderDate } from "@/lib/date";

type ActionsProps = {
  applicationId: string,
  actions: Action[]
}

export default function Actions(props: ActionsProps) {
  const { openDialog, closeDialog } = useDialog()

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Actions</h3>
        <Button variant="outline" size="sm" onClick={() => {
          openDialog({
            id: "new-action-dialog",
            title: "New action",
            children: (<NewActionForm
              applicationId={props.applicationId}
              onSuccess={() => closeDialog("new-action-dialog")}
              onCancel={() => closeDialog("new-action-dialog")} />),
            width: 420,
            height: 380
          })
        }}>
          + Add Action
        </Button>
      </div>

      {props.actions.length === 0 && (
        <p className="text-sm text-muted-foreground">No actions recorded yet.</p>
      )}

      {props.actions.length > 0 && (
        <div className="space-y-3">
          {props.actions.map((action) => (
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
                        children: <Action action={action} />,
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

type ActionProps = {
  action: Action
}
function Action(props: ActionProps) {
  return (
    <form className="spac-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input id="title"
          value={props.action.title}
          placeholder="Action title"
          required disabled
        />
      </div>
      <div className="space-y-1.5">
        <span className="text-muted-foreground">Created</span>
        <p className="font-medium">
          {renderDate(props.action.date)}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">Note</Label>
        <textarea id="note" value={props.action.note as string} rows={3} disabled
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
          placeholder="Optional notes"
        />
      </div>
    </form>
  )
}

type NewActionFormProps = {
  applicationId: string;
  onSuccess: () => void
  onCancel: () => void
}
function NewActionForm(props: NewActionFormProps) {
  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setSubmitting(true);
    setError(null);

    try {
      await POST(`/api/jobs/${props.applicationId}/actions`, {
        title,
        note: note || ""
      });
      props.onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Failed to create action");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="action-title">Title <span className="text-destructive">*</span></Label>
        <Input
          id="action-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Phone screen, Sent resume"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="action-note">Note</Label>
        <textarea
          id="action-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional notes..."
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={props.onCancel}
          disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save Action"}
        </Button>
      </div>
    </form>
  )
}
