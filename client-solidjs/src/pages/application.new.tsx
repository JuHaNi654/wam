import { createRoute } from "@tanstack/solid-router"
import { createForm } from "@tanstack/solid-form"
import ApplicationLayout from "./layouts/application"
import { ApplicationStatus, applicationSchema, TApplication } from "../models/models"
import InputField from "../components/input/InputField"
import SelectField from "../components/input/SelectField"
import PageHeading from "../components/page-heading"

export default createRoute({
  getParentRoute: () => ApplicationLayout,
  path: 'new',
  component: NewApplication
})

type ToPairs<T extends Record<string, string>> = [T[keyof T], T[keyof T]][]
export function toValuePairs<T extends Record<string, string>>(obj: T): ToPairs<T> {
  return Object.entries(obj).map(([label, value]) => [label, value]) as ToPairs<T>
}

const defaultValues: TApplication = {
  name: "",
  company: "",
  position: "",
  homepage: "",
  link: "",
  status: ApplicationStatus.Saved
}

function NewApplication() {
  const form = createForm(() => ({
    defaultValues: defaultValues,
    validators: {
      onSubmit: applicationSchema
    },
    onSubmit: async ({ value }) => {
      console.log("Value: ", value)
    }
  }))

  return (
    <div>
      <PageHeading title="New application" />
      <div class="border border-gray-200 rounded-lg p-4">
        <form onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}>
          <form.Field name="name"
            children={(field) => (
              <InputField label="Name"
                name={field().name} id={field().name} value={field().state.value}
                onInput={(e) => field().handleChange(e.currentTarget.value)}
                onBlur={field().handleBlur}
                errors={field().state.meta.errors.map((err) => err?.message || "")} />
            )}
          />
          <div class="flex gap-4 w-full">
            <form.Field name="company"
              children={(field) => (
                <InputField label="Company"
                  name={field().name} id={field().name} value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur}
                  errors={field().state.meta.errors.map((err) => err?.message || "")} />
              )}
            />

            <form.Field name="position"
              children={(field) => (
                <InputField label="Company position"
                  name={field().name} id={field().name} value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur}
                  errors={field().state.meta.errors.map((err) => err?.message || "")} />
              )}
            />
          </div>

          <div class="flex gap-4 w-full">
            <form.Field name="homepage"
              children={(field) => (
                <InputField label="Company homepage"
                  name={field().name} id={field().name} value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur} placeholder="https://"
                  errors={field().state.meta.errors.map((err) => err?.message || "")} />
              )}
            />

            <form.Field name="link"
              children={(field) => (
                <InputField label="Job ad post"
                  name={field().name} id={field().name} value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur} placeholder="https://"
                  errors={field().state.meta.errors.map((err) => err?.message || "")} />
              )}
            />
          </div>

          <form.Field name="status"
            children={(field) => (
              <SelectField name={field().name} value={field().state.value} label="Status"
                onInput={(e) => field().handleChange(e.currentTarget.value as any)}
                onBlur={field().handleBlur}>
                <option value={ApplicationStatus.Saved}>Saved</option>
                <option value={ApplicationStatus.Applied}>Applied</option>
                <option value={ApplicationStatus.Interviewing}>Interviewing</option>
                <option value={ApplicationStatus.Offered}>Offered</option>
                <option value={ApplicationStatus.Rejected}>Rejected</option>
                <option value={ApplicationStatus.Withdrawn}>Withdrawn</option>
              </SelectField>
            )}
          />

          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting
            })}
            children={(state) => (
              <button class="btn btn-soft mt-4" type="submit" disabled={!state().canSubmit}>
                {state().isSubmitting ? '...' : 'Create'}
              </button>
            )}
          />
        </form>
      </div>
    </div>
  )
}
