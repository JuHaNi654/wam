import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { POST } from "@/lib/api"
import type { ApplicationStatus } from "@/types/api.types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"


const statusOptions: Array<{ label: string, value: ApplicationStatus }> = [
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Offered", value: "offered" },
  { label: "Rejected", value: "rejected" },
  { label: "withdrawn", value: "withdrawn" },
] as const;


const formSchema = z.object({
  name: z.string(),
  company: z.string(),
  job_title: z.string(),
  homepage: z.string(),
  link: z.string(),
  status: z.string()
})


type Application = z.infer<typeof formSchema>
export type SavedApplication = {
  id: string;
  create_date: number;
} & Application

type ApplicationFormProps = {
  onSubmit?: () => void;
  onSuccess?: (data: SavedApplication) => void;
}
export default function ApplicationForm(props: ApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<Application>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      job_title: "",
      homepage: "",
      link: "",
      status: ""
    }
  })

  const handleSubmit = async (data: Application) => {
    setSubmitting(true)
    if (props.onSubmit) props.onSubmit()

    try {
      const response = await POST<{ application: SavedApplication }>("/api/jobs", data);
      if (props.onSuccess) props.onSuccess(response.data.application)
    } catch (err: any) {
      console.log(err)
      setSubmitting(false)
    }
  }

  return (
    <form id="application-form" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller name="name" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Application name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Example name"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex gap-4">
          <Controller name="company" control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Company name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Company"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller name="job_title" control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Company position</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="ex. Senior developer"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Controller name="homepage" control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Company homepage</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="https://..."
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller name="link" control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Job post</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="https://..."
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller name="status" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  <SelectItem value="auto">Select</SelectItem>
                  <SelectSeparator />
                  {statusOptions.map((options) => (
                    <SelectItem key={options.value} value={options.value}>
                      {options.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </FieldGroup>
      <FieldGroup className="mt-6">
        <Field orientation="horizontal">
          <Button type="submit" form="application-form" disabled={submitting}>
            {submitting ? "Creating ..." : "Create"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
