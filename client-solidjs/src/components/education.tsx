import { Modal, ModalFooter } from "./modal"
import { createSignal, Show, For, } from "solid-js"
import { Portal } from "solid-js/web";
import { createForm } from "@tanstack/solid-form"
import { educationSchema, TSavedEducation } from "../models/models"
import InputField from "../components/input/InputField"
import DateField from "./input/DateField";
import { Button, IconButton } from "./elements/button";
import { POST, DELETE } from "../utils/api";
import { renderDate } from "../utils/date";
import { DeleteConfirmationDialog } from "./alert-dialog";

type Props = {
  data: Array<TSavedEducation>
}
export default function Education(props: Props) {
  const [educations, setEducations] = createSignal(props.data)
  const [showModal, setShowModal] = createSignal(false)
  const form = createForm(() => ({
    defaultValues: {
      school: "",
      program: "",
      start_date: 0,
      end_date: 0,
    },
    validators: {
      onSubmit: educationSchema
    },
    onSubmit: async ({ value }) => {
      const result = await POST<TSavedEducation>('/profile/education', value)
      console.log(result)

      if (result.error) {
        console.error(result.error)
        return
      }

      if (result.response && result.response.data) {
        setEducations([...educations(), result.response.data])
      }
    }
  }))

  const handleSubmit = async () => {
    await form.handleSubmit()
    if (form.state.isValid) {
      setShowModal(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await DELETE(`/profile/education/${id}`, null)
    if (error) {
      console.error(error)
      return
    }

    setEducations(educations().filter((item) => item.id !== id))
  }

  return (
    <div class="flex flex-col gap-2 p-4 rounded-lg ring-1 ring-white/20 bg-zinc-800">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide">Education</h3>
        <IconButton label="New education entry" icon="ri-add-line" size="sm" onClick={() => setShowModal(true)} />
        <Show when={showModal()}>
          <Portal>
            <Modal subTitle="Education" title="New entry"
              footer={(
                <ModalFooter>
                  <Button onClick={() => setShowModal(false)} variant="outline" label="Cancel" />
                  <Button onClick={handleSubmit} variant="primary" label="Save entry" />
                </ModalFooter>
              )}
              onClose={() => setShowModal(false)}>
              <form id="education-form" onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}>
                <form.Field name="school"
                  children={(field) => (
                    <InputField label="School" name={field().name}
                      value={field().state.value}
                      onInput={(e) => field().handleChange(e.currentTarget.value)}
                      onBlur={field().handleBlur}
                      errors={field().state.meta.errors.map((err) => err?.message || "")}
                    />
                  )} />

                <form.Field name="program"
                  children={(field) => (
                    <InputField label="Program" name={field().name}
                      value={field().state.value}
                      onInput={(e) => field().handleChange(e.currentTarget.value)}
                      onBlur={field().handleBlur}
                      errors={field().state.meta.errors.map((err) => err?.message || "")}
                    />
                  )} />

                <div class="flex gap-4">
                  <form.Field name="start_date"
                    children={(field) => (
                      <DateField label="Start date" name={field().name} value={field().state.value}
                        onChange={(e) => field().handleChange(e)}
                        onBlur={field().handleBlur}
                        errors={field().state.meta.errors.map((err) => err?.message || "")}
                      />
                    )} />

                  <form.Field name="end_date"
                    children={(field) => (
                      <DateField label="End date" name={field().name} value={field().state.value}
                        onChange={(e) => field().handleChange(e)}
                        onBlur={field().handleBlur}
                        errors={field().state.meta.errors.map((err) => err?.message || "")}
                      />
                    )} />
                </div>
              </form>
            </Modal>
          </Portal>
        </Show>
      </header>
      <ul class="flex flex-col gap-2">
        <For each={educations()}>
          {(item) => (
            <li class="flex items-center gap-4 text-sm border-l-2 border-border pl-4">
              <div class="flex-1">
                <h3 class="font-semibold">{item.program}</h3>
                <span class="block">{item.school}</span>
              </div>
              <div>
                <span>{renderDate(item.start_date)} - {renderDate(item.end_date)}</span>
              </div>
              <DeleteConfirmationDialog id="delete-application"
                title="Are you sure, you want to delete selected item"
                description={`You are currently deleting (${item.program}).`}
                onCancel={() => { }} onConfirmation={() => handleDelete(item.id)} />

            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
