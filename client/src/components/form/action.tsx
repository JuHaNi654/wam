import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { POST, PUT } from "@/lib/api"
import { Textarea } from "../ui/textarea"
import { renderDate } from "@/lib/date"
import { toast } from "sonner"
import { DatePickerInput } from "../date-picker"

const formSchema = z.object({
  title: z.string(),
  note: z.string(),
  date: z.number()
})

export type Action = z.infer<typeof formSchema>
export type SavedAction = {
  id: string;
  job_id: string;
} & Action
type ActionFormProps = {
  applicationId: string;
  onCancel?: () => void;
  onSubmit?: (data: SavedAction) => void;
}

export default function ActionForm(props: ActionFormProps) {
  const form = useForm<Action>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      note: "",
      date: new Date().getTime() / 1000
    }
  })

  const handleSubmit = async (data: Action) => {
    const result = await POST<SavedAction>(`/api/applications/${props.applicationId}/actions`, data);
    if (result.error) {
      console.error(result.error)
      toast.error("Something went wrong while trying to create new action", { position: "bottom-right" })
      return
    }

    if (props.onSubmit && result.response) props.onSubmit((result.response.data as SavedAction))
  }

  const handleCancel = () => {
    form.reset()
    if (props.onCancel) props.onCancel()
  }

  return (
    <form id="action-form" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller name="date" control={form.control}
          render={({ field }) => (
            <DatePickerInput label="Date" valueInUnix={field.value}
              onChange={(date) => field.onChange(date)}
            />
          )}>
        </Controller>


        <Controller name="title" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="ex. Email received"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller name="note" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Information about action ..."
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
          <Button type="submit" form="action-form">
            Submit
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

type UpdateActionFormProps = {
  action: SavedAction
  onSave?: (actionId: string, data: Action) => void
}
export function UpdateActionForm(props: UpdateActionFormProps) {
  const form = useForm<Action>({
    resolver: zodResolver(formSchema),
    defaultValues: props.action
  })

  const handleSubmit = async (data: Action) => {
    const { error } = await PUT(`/api/actions/${props.action.id}`, data)
    if (error) {
      console.error(error)
      toast.error("Something went wrong while trying to update action", { position: "bottom-right" })
    }

    if (props.onSave) props.onSave(props.action.id, data)
    toast.success("Action updated", { position: "bottom-right" })
  }

  return (
    <form id="action-form" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <div className="text-sm">
          <h3>Date of action</h3>
          <span>{renderDate(props.action.date)}</span>
        </div>

        <Controller name="title" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="ex. Email received"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller name="note" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Information about action ..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <FieldGroup className="mt-6">
        <Field orientation="horizontal">
          <Button type="submit" form="action-form">
            Save
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
