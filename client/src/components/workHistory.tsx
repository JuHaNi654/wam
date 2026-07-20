import { useDialog } from "@/context/dialog-context"
import { Button } from "./ui/button"
import { RiEyeLine } from "@remixicon/react"
import HistoryForm, { UpdateHistoryForm } from "./form/history"
import type { SavedWorkHistory, WorkHistory } from "./form/history"
import { useState } from "react"
import { DeleteConfirmationDialog } from "./dialog/alert-dialog"
import { DELETE } from "@/lib/api"
import { toast } from "sonner"

type Props = {
  data: SavedWorkHistory[]
}
export default function WorkHistory(props: Props) {
  const { openDialog, closeDialog } = useDialog()
  const [history, setHistory] = useState(props.data)

  const handleSave = (id: string, data: WorkHistory) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    )
  }

  const handleDelete = async (id: string) => {
    const { error } = await DELETE(`/api/profile/history/${id}`, null)
    if (error) {
      console.error(error)
      toast.success("Could not delete current work history", { position: "bottom-right" })
      return
    }

    setHistory((prev) => (
      prev.filter((item) => item.id !== id)
    ))
    toast.success("Work history deleted", { position: "bottom-right" })
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Work history</h3>
        <Button variant="outline" size="sm" onClick={() => {
          openDialog({
            id: "new-experience",
            title: "New work experience",
            children: (
              <HistoryForm
                onCancel={() => closeDialog("new-experience")}
                onSubmit={(data: SavedWorkHistory) => {
                  setHistory((prev) => [...prev, data])
                  closeDialog("new-experience")
                }}
              />
            ),
            width: 420,
            height: 380,
          })
        }}>
          + Add work history
        </Button>
      </div>

      {history.length === 0 && (
        <p className="text-sm text-muted-foreground">No work history saved</p>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          {history.map((history) => (
            <div key={history.id} className="flex gap-4 text-sm border-l-2 border-border pl-4">
              <div className="flex-1">
                <h3 className="font-semibold">{history.company}</h3>
                <span>{history.title}</span>
              </div>

              <div className="space-y-2">
                <Button type="button" variant="ghost"
                  size="icon-sm"
                  aria-label="View history"
                  className="shrink-0 cursor-pointer"
                  onClick={() => {
                    openDialog({
                      id: history.id,
                      title: "Work history",
                      children: <UpdateHistoryForm history={history} onSave={handleSave} />,
                      width: 520,
                      height: 560,
                    })
                  }}
                >
                  <RiEyeLine />
                </Button>
                <DeleteConfirmationDialog buttonLabel="Delete work history"
                  title="Are you sure, you want to delete selected item"
                  description={`You are currently deleting (${history.title}) history.`}
                  onConfirmation={() => handleDelete(history.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
