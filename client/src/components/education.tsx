import { useDialog } from "@/context/dialog-context"
import type { Education } from "@/types/api.types"
import { Button } from "./ui/button"
import { renderDate } from "@/lib/date"
import EducationForm, { type SavedEducation } from "./form/education"
import { DeleteConfirmationDialog } from "./dialog/alert-dialog"
import { useState } from "react"
import { DELETE } from "@/lib/api"
import { toast } from "sonner"

type Props = {
  data: Education[]
}
export default function Education(props: Props) {
  const [educations, setEducations] = useState(props.data)
  const { openDialog, closeDialog } = useDialog()

  const handleDelete = async (id: string) => {
    try {
      await DELETE(`/api/profile/education/${id}`)
      setEducations((prev) => prev.filter((item) => item.id !== id))
      toast.success("Selected education deleted successfully", { position: "bottom-right" })
    } catch (err) {
      console.error(err)
      toast.success("Something went wrong while trying to delete education", { position: "bottom-right" })
    }
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Education
        </h3>
        <Button variant="outline" size="sm" onClick={() => {
          openDialog({
            id: "new-education",
            title: "New education",
            children: (
              <EducationForm
                onCancel={() => closeDialog('new-education')}
                onSubmit={(data: SavedEducation) => {
                  setEducations((prev) => [...prev, data])
                  closeDialog('new-education')
                }} />
            ),
            width: 420,
            height: 380,
          })
        }}>
          + Add education
        </Button>
      </div>

      {educations.length === 0 && (
        <p className="text-sm text-muted-foreground">No education saved</p>
      )}

      {educations.length > 0 && (
        <div className="space-y-3">
          {educations.map((education) => (
            <div key={education.id} className="flex items-center gap-4 text-sm border-l-2 border-border pl-4">
              <div className="flex-1">
                <h3 className="font-semibold">{education.program}</h3>
                <span>{education.school}</span>
              </div>
              <div>
                <span>{renderDate(education.start_date)} - {renderDate(education.end_date)}</span>
              </div>
              <DeleteConfirmationDialog buttonLabel="Delete education"
                title="Are you sure, you want to delete selected item"
                description={`You are currently deleting (${education.school} - ${education.program}).`}
                onConfirmation={() => handleDelete(education.id as string)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
