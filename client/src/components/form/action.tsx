import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { POST } from "@/lib/api"
import { Textarea } from "../ui/textarea"

const formSchema = z.object({
  title: z.string(),
  note: z.string()
})

type Action = z.infer<typeof formSchema>
type ActionFormProps = {
  applicationId: string;
  onCancel?: () => void;
  onSubmit?: () => void;
}

export default function ActionForm(props: ActionFormProps) {
  const form = useForm<Action>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      note: ""
    }
  })

  const handleSubmit = async (data: Action) => {
    try {
      await POST(`/api/jobs/${props.applicationId}/actions`, data);
      if (props.onSubmit) props.onSubmit()
    } catch (err: any) {
      console.log(err)
    }
  }

  const handleCancel = () => {
    form.reset()
    if (props.onCancel) props.onCancel()
  }

  return (
    <form id="action-form" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller name="title" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
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

        <Controller name="note" control={form.control}
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
          <Button type="submit" form="action-form">
            Submit
          </Button>
        </Field>
      </FieldGroup>
    </form>

  )
}
