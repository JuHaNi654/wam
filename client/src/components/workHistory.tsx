import { useDialog } from "@/context/dialog-context"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { DatePickerInput } from "./date-picker"
import { Checkbox } from "./ui/checkbox"
import { useState, type ChangeEvent } from "react"
import { Textarea } from "./ui/textarea"
import { POST } from "@/lib/api"
import type { History } from "@/types/api.types"
import { RiEyeLine } from "@remixicon/react"
import { renderDate } from "@/lib/date"
import HistoryForm from "./form/history"

type Props = {
  data: History[]
}
export default function WorkHistory(props: Props) {
  const { openDialog, closeDialog } = useDialog()

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
                      children: <ViewHistory history={history} />,
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

type ViewHistoryProps = {
  history: History
}
function ViewHistory(props: ViewHistoryProps) {
  return (
    <form className="spac-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input id="title" name="title"
          value={props.history.title}
          placeholder="Job title"
          required disabled
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="company">Company <span className="text-destructive">*</span></Label>
        <Input id="company" name="company"
          value={props.history.company}
          placeholder="Company"
          required disabled
        />
      </div>

      <div className="flex gap-4">
        <div className="space-y-1.5">
          <span className="text-muted-foreground">Start</span>
          <p className="font-medium">
            {renderDate(props.history.start_date)}
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="text-muted-foreground">End</span>
          <p className="font-medium">
            {renderDate(props.history.end_date)}
          </p>
        </div>
      </div>


      <div className="space-y-1.5">
        <Label htmlFor="current-position">Current position</Label>
        <Checkbox id="current-position" checked={props.history.current} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Description</Label>
        <textarea id="note" value={props.history.description as string} rows={3} disabled
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
          placeholder="Description ..."
        />
      </div>
    </form>
  )
}
