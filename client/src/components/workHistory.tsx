import { useDialog } from "@/context/dialog-context"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { DatePickerInput } from "./date-picker"
import { Checkbox } from "./ui/checkbox"
import { useState, type ChangeEvent } from "react"
import { Textarea } from "./ui/textarea"

export default function WorkHistory() {
  const { openDialog, closeDialog } = useDialog()

  const handleSave = async (work: WorkItem) => {
    console.log("Create new work item: ", work)
    closeDialog('new-experience')
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Work history</h3>
        <Button variant="outline" size="sm" onClick={() => {
          openDialog({
            id: "new-experience",
            title: "New work experience",
            children: <CreateExperience handleSubmit={handleSave} />,
            width: 420,
            height: 380,
          })
        }}>
          + Add work history
        </Button>
      </div>
    </div>
  )
}

type WorkItem = {
  company: string;
  position: string;
  starting_date: number;
  ending_date?: number;
  current: boolean
  description: string;
}

type CreateExperienceProps = {
  handleSubmit(work: WorkItem): void
}

function CreateExperience(props: CreateExperienceProps) {
  const [work, setWork] = useState<WorkItem>({
    company: "",
    position: "",
    starting_date: 0,
    ending_date: 0,
    current: false,
    description: "",
  })

  const onInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setWork({ ...work, [e.target.name]: e.target.value })
  }

  const onPropertyChange = (name: string, value: any) => {
    setWork({ ...work, [name]: value })
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      props.handleSubmit(work)
    }} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" value={work.company} placeholder="Company name"
          onChange={onInputChange} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="position">Position / Job title</Label>
        <Input id="position" name="position" value={work.position} placeholder="ex. Senior developer"
          onChange={onInputChange} required />
      </div>

      <div className="space-y-1.5 flex gap-4">
        <DatePickerInput label="Starting date"
          onDateChange={(date) => onPropertyChange("starting_date", date.getTime() / 1000)} />
        <DatePickerInput label="Ending date"
          onDateChange={(date) => onPropertyChange("ending_date", date.getTime() / 1000)}
          disabled={work.current} />
      </div>

      <div className="space-y-1.5 flex flex-row-reverse gap-2 justify-end">
        <Label htmlFor="current-position">Current position</Label>
        <Checkbox id="current-position" checked={work.current}
          onCheckedChange={(checked) => onPropertyChange("current", checked === true)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={work.description} onChange={onInputChange} />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit">
          Create
        </Button>
      </div>
    </form>
  )
}
