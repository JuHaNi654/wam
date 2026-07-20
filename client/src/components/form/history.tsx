import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { DatePickerInput } from "../date-picker"
import { Button } from "../ui/button"
import { POST, PUT } from "@/lib/api"
import { Checkbox } from "../ui/checkbox"
import { Textarea } from "../ui/textarea"
import { toast } from "sonner"

const formSchema = z.object({
  company: z.string().min(3),
  title: z.string().min(3),
  description: z.string(),
  start_date: z.number(),
  end_date: z.number(),
  current: z.boolean()
})

export type WorkHistory = z.infer<typeof formSchema>
export type SavedWorkHistory = {
  id: string
} & WorkHistory
const getCurrentDateInUnix = () => new Date().getTime() / 1000

type HistoryFormProps = {
  onCancel?: () => void
  onSubmit?: (res: SavedWorkHistory) => void
}

export default function HistoryForm(props: HistoryFormProps) {
  const form = useForm<WorkHistory>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      title: "",
      description: "",
      current: false,
      start_date: getCurrentDateInUnix(),
      end_date: getCurrentDateInUnix(),
    }
  })

  const handleSubmit = async (data: WorkHistory) => {
    data.start_date = Number(data.start_date.toFixed(0))
    data.end_date = Number(data.end_date.toFixed(0))
    const result = await POST<SavedWorkHistory>(`/api/profile/history`, data)
    if (result.error) {
      console.error(result.error)
      toast.error("Something went wrong while trying to save new work history", { position: "bottom-right" })
      return
    }

    if (props.onSubmit && result.response) props.onSubmit((result.response.data as SavedWorkHistory))
  }

  const handleCancel = () => {
    form.reset()
    if (props.onCancel) props.onCancel()
  }

  return (
    <form id="work-history" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller name="company" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Company</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Company name ..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller name="title" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Job title</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Developer ..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex gap-4">
          <Controller name="start_date" control={form.control}
            render={({ field }) => (
              <DatePickerInput label="Start" valueInUnix={field.value}
                onChange={(date) => field.onChange(date)}
              />
            )}
          />
          <Controller name="end_date" control={form.control}
            render={({ field }) => (
              <DatePickerInput label="End" valueInUnix={field.value}
                onChange={(date) => field.onChange(date)} disabled={form.watch("current")}
              />
            )}
          />
        </div>

        <Controller name="current" control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox id="current" name={field.name} checked={field.value}
                onCheckedChange={field.onChange} />
              <FieldLabel htmlFor="current" className="font-normal">
                Current workplace
              </FieldLabel>
            </Field>
          )}
        />


        <Controller name="description" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Developer ..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>


      <FieldGroup className="mt-6">
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={handleCancel} >
            Cancel
          </Button>
          <Button type="submit" form="work-history">
            Submit
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

type UpdateHistoryFormProps = {
  history: SavedWorkHistory
  onSave?: (id: string, history: WorkHistory) => void
}
export function UpdateHistoryForm(props: UpdateHistoryFormProps) {
  const form = useForm<WorkHistory>({
    resolver: zodResolver(formSchema),
    defaultValues: props.history
  })

  const handleSubmit = async (data: WorkHistory) => {
    const { error } = await PUT(`/api/profile/history/${props.history.id}`, data)
    if (error) {
      console.log(error)
      return
    }

    if (props.onSave) props.onSave(props.history.id, data)
  }

  return (
    <form id="work-history" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller name="company" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Company</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Company name ..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller name="title" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Job title</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Developer ..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex gap-4">
          <Controller name="start_date" control={form.control}
            render={({ field }) => (
              <DatePickerInput label="Start" valueInUnix={field.value}
                onChange={(date) => field.onChange(date)}
              />
            )}
          />
          <Controller name="end_date" control={form.control}
            render={({ field }) => (
              <DatePickerInput label="End" valueInUnix={field.value}
                onChange={(date) => field.onChange(date)} disabled={form.watch("current")}
              />
            )}
          />
        </div>

        <Controller name="current" control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox id="current" name={field.name} checked={field.value}
                onCheckedChange={field.onChange} />
              <FieldLabel htmlFor="current" className="font-normal">
                Current workplace
              </FieldLabel>
            </Field>
          )}
        />


        <Controller name="description" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Developer ..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>


      <FieldGroup className="mt-6">
        <Field orientation="horizontal">
          <Button type="submit" form="work-history">
            Save
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
