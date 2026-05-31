import { useDialog } from "@/context/dialog-context"
import { Button } from "./ui/button"
import { RiEyeLine } from "@remixicon/react"
import HistoryForm, { UpdateHistoryForm } from "./form/history"
import type { SavedWorkHistory, WorkHistory } from "./form/history"
import { useState } from "react"

type Props = {
  data: SavedWorkHistory[]
}
export default function WorkHistory(props: Props) {
  const { openDialog, closeDialog } = useDialog()
  const [history, setHistory] = useState(props.data)

  const handleSave = (id: string, data: WorkHistory) => {
    const tmp = history
    for (let i = 0; i < tmp.length; i++) {
      if (tmp[i].id === id) {
        Object.assign(tmp[i], data)
      }
    }

    setHistory(tmp)
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
                onSubmit={() => closeDialog("new-experience")}
              />
            ),
            width: 420,
            height: 380,
          })
        }}>
          + Add work history
        </Button>
      </div>

      {props.data.length === 0 && (
        <p className="text-sm text-muted-foreground">No work history saved</p>
      )}

      {props.data.length > 0 && (
        <div className="space-y-3">
          {props.data.map((history) => (
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
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
