import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { DatePickerInput } from "../date-picker"
import { Button } from "../ui/button"
import { POST } from "@/lib/api"
import { Checkbox } from "../ui/checkbox"
import { Textarea } from "../ui/textarea"


const formSchema = z.object({
  company: z.string().min(3),
  title: z.string().min(3),
  description: z.string(),
  start_date: z.number(),
  end_date: z.number(),
  current: z.boolean()
})

type WorkHistory = z.infer<typeof formSchema>
const getCurrentDateInUnix = () => new Date().getTime() / 1000

type HistoryFormProps = {
  onCancel?: () => void
  onSubmit?: () => void
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
    try {
      await POST(`/api/profile/history`, data)
      if (props.onSubmit) props.onSubmit()
    } catch (err: unknown) {
      console.log(err)
    }
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
