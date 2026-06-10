import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { DatePickerInput } from "../date-picker"
import { Button } from "../ui/button"
import { POST } from "@/lib/api"
import { toast } from "sonner"

const formSchema = z.object({
  school: z.string().min(5),
  program: z.string().min(5),
  start_date: z.number(),
  end_date: z.number(),
})

export type Education = z.infer<typeof formSchema>
export type SavedEducation = {
  id: string
} & Education
const getCurrentDateInUnix = () => new Date().getTime() / 1000


type EducationFormProps = {
  onCancel?: () => void
  onSubmit?: (data: SavedEducation) => void
}
export default function EducationForm(props: EducationFormProps) {
  const form = useForm<Education>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school: "",
      program: "",
      start_date: getCurrentDateInUnix(),
      end_date: getCurrentDateInUnix(),
    }
  })

  const handleSubmit = async (data: Education) => {
    try {
      data.start_date = Number(data.start_date.toFixed(0))
      data.end_date = Number(data.end_date.toFixed(0))
      const response = await POST<SavedEducation>(`/api/profile/education`, data)
      if (props.onSubmit) props.onSubmit(response.data)
    } catch (err: any) {
      console.error(err)
      toast.error("Something went wrong while trying to save new education", { position: "bottom-right" })
    }
  }

  const handleCancel = () => {
    form.reset()
    if (props.onCancel) props.onCancel()
  }

  return (
    <form id="education-form" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller name="school" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>School</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="School"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller name="program" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Program</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Ex. Marketing"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="flex gap-4">
          <Controller name="start_date" control={form.control}
            render={({ field }) => (
              <DatePickerInput label="Start date" valueInUnix={field.value}
                onChange={(date) => field.onChange(date)}
              />
            )}
          />
          <Controller name="end_date" control={form.control}
            render={({ field }) => (
              <DatePickerInput label="End date" valueInUnix={field.value}
                onChange={(date) => field.onChange(date)}
              />
            )}
          />
        </div>
      </FieldGroup>
      <FieldGroup className="mt-6">
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={handleCancel} >
            Cancel
          </Button>
          <Button type="submit" form="education-form">
            Submit
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
