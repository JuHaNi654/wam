import { useDialog } from "@/context/dialog-context"
import type { Education } from "@/types/api.types"
import { Button } from "./ui/button"
import { renderDate } from "@/lib/date"
import EducationForm from "./form/education"

type Props = {
  data: Education[]
}
export default function Education(props: Props) {
  const { openDialog, closeDialog } = useDialog()

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
                onSubmit={() => closeDialog('new-education')} />
            ),
            width: 420,
            height: 380,
          })
        }}>
          + Add education
        </Button>
      </div>

      {props.data.length === 0 && (
        <p className="text-sm text-muted-foreground">No education saved</p>
      )}

      {props.data.length > 0 && (
        <div className="space-y-3">
          {props.data.map((education) => (
            <div key={education.id} className="flex gap-4 text-sm border-l-2 border-border pl-4">
              <div className="flex-1">
                <h3 className="font-semibold">{education.program}</h3>
                <span>{education.school}</span>
              </div>
              <div>
                <span>{renderDate(education.start_date)} - {renderDate(education.end_date)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
