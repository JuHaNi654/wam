import type { TSavedWorkHistory } from "../models/models"
import { workHistorySchema } from "../models/models"
import { DeleteConfirmationDialog } from "./alert-dialog";
import { Modal, ModalFooter } from "./modal"
import { createSignal, For, Show } from "solid-js"
import { Portal } from "solid-js/web";
import { createForm } from "@tanstack/solid-form"
import { Button } from "./elements/button";
import InputField from "./input/InputField";
import TextareaField from "./input/TextareaField";
import DateField from "./input/DateField";
import BooleanField from "./input/BooleanField";

type Props = {
  data: Array<TSavedWorkHistory>
}

export default function WorkHistory(props: Props) {
  const [workHistory, setWorkHistory] = createSignal(props.data)
  const [showModal, setShowModal] = createSignal<{ [k: string]: boolean }>({})

  const toggleTargetModal = (id: string, value: boolean) => {
    setShowModal({ ...showModal(), [id]: value })
  }

  const handleDelete = async (id: string) => {
    console.log("Delete work history: ", id)
  }

  return (
    <div class="flex flex-col gap-2 border rounded-lg border-gray-200 p-4">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide">Work history</h3>
        <button class="btn btn-soft" onClick={() => toggleTargetModal("new-history", true)}>
          <i class="ri-add-line"></i>
        </button>
        <Show when={showModal()["new-history"]}>
          <Portal>
            <NewWorkExperience toggleVisibility={() => toggleTargetModal("new-history", false)} />
          </Portal>
        </Show>
      </header>
      <div>
        <ul class="flex flex-col gap-4">
          <For each={workHistory()}>
            {(item) => (
              <li class="flex items-center gap-4 text-sm border-l-2 border-border pl-4">
                <div class="flex-1 flex flex-col">
                  <h3 class="font-semibold">{item.title}</h3>
                  <span class="block">{item.company}</span>
                </div>
                <div class="flex gap-2">
                  <button class="btn btn-soft" onClick={() => toggleTargetModal(item.id, true)}>
                    <i class="ri-eye-line"></i>
                  </button>
                  <Show when={showModal()[item.id]}>
                    <Portal>
                      <EditExperience toggleVisibility={() => toggleTargetModal(item.id, false)} item={item} />
                    </Portal>
                  </Show>
                  <DeleteConfirmationDialog id="delete-application"
                    title="Are you sure, you want to delete selected item"
                    description={`You are currently deleting (${item.title}).`}
                    onCancel={() => { }} onConfirmation={() => handleDelete(item.id)} />
                </div>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  )
}

type NewWorkExperienceProps = {
  toggleVisibility: () => void
  onSuccess?: (item: TSavedWorkHistory) => void
}
function NewWorkExperience(props: NewWorkExperienceProps) {
  const form = createForm(() => ({
    defaultValues: {
      company: "",
      title: "",
      description: "",
      start_date: 0,
      end_date: 0,
      current: false,
    },
    validators: {
      onSubmit: workHistorySchema
    },
    onSubmit: async ({ value }) => {
      console.log("Submit: ", value)
    }
  }))

  return (
    <Modal subTitle="Work history" title="New entry"
      onClose={props.toggleVisibility}
      footer={(
        <ModalFooter>
          <Button variant="outline" label="Cancel" />
          <Button variant="primary" label="Save entry" />
        </ModalFooter>
      )}>
      <form id="new-work-history" onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}>
        <form.Field name="company"
          children={(field) => (
            <InputField label="Company" name={field().name}
              value={field().state.value}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
              errors={field().state.meta.errors.map((err) => err?.message || "")}
            />
          )} />

        <form.Field name="title"
          children={(field) => (
            <InputField label="Job title" name={field().name}
              value={field().state.value}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
              errors={field().state.meta.errors.map((err) => err?.message || "")}
            />
          )} />

        <form.Field name="description"
          children={(field) => (
            <TextareaField label="Description" name={field().name}
              value={field().state.value}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
              errors={field().state.meta.errors.map((err) => err?.message || "")}
            />
          )} />

      </form>

      <div class="flex gap-4">
        <form.Field name="start_date"
          children={(field) => (
            <DateField label="Start date" name={field().name} value={field().state.value}
              onChange={(e) => field().handleChange(e)}
              onBlur={field().handleBlur}
              errors={field().state.meta.errors.map((err) => err?.message || "")}
            />
          )} />

        <form.Subscribe
          selector={(state) => state.values.current}
          children={(current) => (
            <form.Field name="end_date"
              children={(field) => (
                <DateField disabled={current()} label="End date" name={field().name} value={field().state.value}
                  onChange={(e) => field().handleChange(e)}
                  onBlur={field().handleBlur}
                  errors={field().state.meta.errors.map((err) => err?.message || "")}
                />
              )} />
          )}
        />

        <form.Field name="current"
          children={(field) => (
            <BooleanField label="Current" name={field().name} checked={field().state.value}
              onChange={(e) => field().handleChange(e.target.checked)}
              onBlur={field().handleBlur}
              errors={field().state.meta.errors.map((err) => err?.message || "")}
            />
          )} />

      </div>
    </Modal>
  )
}


type EditExperienceProps = {
  item: TSavedWorkHistory
  toggleVisibility: () => void
}
function EditExperience(props: EditExperienceProps) {
  return (
    <Modal subTitle={props.item.company} title={props.item.title}
      onClose={props.toggleVisibility}>
      <p>placeholder</p>
    </Modal>
  )
}
