import type { TSavedWorkHistory, TWorkHistory } from "../models/models"
import { workHistorySchema } from "../models/models"
import { DeleteConfirmationDialog } from "./alert-dialog";
import { Modal, ModalFooter } from "./modal"
import { createSignal, For, Show } from "solid-js"
import { Portal } from "solid-js/web";
import { createForm } from "@tanstack/solid-form"
import { Button, IconButton } from "./elements/button";
import InputField from "./input/InputField";
import TextareaField from "./input/TextareaField";
import DateField from "./input/DateField";
import BooleanField from "./input/BooleanField";
import { DELETE, POST, PUT } from "../utils/api";

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
    const { error } = await DELETE(`/profile/history/${id}`, null)
    if (error) {
      console.error("Error occurred while trying to delete history:")
      console.error(error)
      return
    }

    setWorkHistory(workHistory().filter((item) => item.id !== id))
  }

  const saveWorkHistoryItem = (item: TSavedWorkHistory) => {
    setWorkHistory([...workHistory(), item])
  }

  const updateWorkHistoryItem = (item: TSavedWorkHistory) => {
    setWorkHistory(workHistory().map((history) => history.id === item.id ? item : history))
  }

  return (
    <div class="flex flex-col gap-2 rounded-lg p-4 ring-1 ring-white/20 bg-zinc-800">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide">Work history</h3>
        <IconButton size="sm" icon="ri-add-line" label="New experience entry" onClick={() => toggleTargetModal("new-history", true)} />
        <Show when={showModal()["new-history"]}>
          <Portal>
            <FormWorkExperience onSuccess={saveWorkHistoryItem} title="New entry"
              action="create" toggleVisibility={() => toggleTargetModal("new-history", false)} />
          </Portal>
        </Show>
      </header>
      <ul class="flex flex-col gap-2">
        <For each={workHistory()}>
          {(item) => (
            <li class="flex items-center gap-4 text-sm border-l-2 border-border pl-4">
              <div class="flex-1 flex flex-col">
                <h3 class="font-semibold">{item.title}</h3>
                <span class="block">{item.company}</span>
              </div>
              <div class="flex gap-2">
                <IconButton icon="ri-eye-line" size="sm" label="Edit entry" onClick={() => toggleTargetModal(item.id, true)} />
                <Show when={showModal()[item.id]}>
                  <Portal>
                    <FormWorkExperience title="Edit entry" onSuccess={updateWorkHistoryItem}
                      action="update" toggleVisibility={() => toggleTargetModal(item.id, false)} item={item} />
                  </Portal>
                </Show>
                <DeleteConfirmationDialog id="delete-application"
                  title="Are you sure, you want to delete selected item"
                  description={`You are currently deleting (${item.title}).`}
                  onCancel={() => toggleTargetModal(item.id, false)}
                  onConfirmation={() => handleDelete(item.id)} />
              </div>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}

type FormWorkExperienceProps = {
  title: string
  action: 'update' | 'create'
  item?: TSavedWorkHistory
  toggleVisibility: () => void
  onSuccess?: (item: TSavedWorkHistory) => void
}

const defaultHistoryValues: TWorkHistory = {
  company: "",
  title: "",
  description: "",
  start_date: 0,
  end_date: 0,
  current: false,
}

function FormWorkExperience(props: FormWorkExperienceProps) {
  const form = createForm(() => ({
    defaultValues: props.item || defaultHistoryValues,
    validators: {
      onSubmit: workHistorySchema
    },
    onSubmit: async ({ value }) => {
      if (props.action === 'create') {
        const result = await POST<TSavedWorkHistory>(`/profile/history`, value)
        if (result.error) {
          console.error("Error occurred while trying to save new experience:")
          console.error(result.error)
        }

        if (props.onSuccess) props.onSuccess(result!.response!.data)
      } else {
        const { id, ...data } = value as TSavedWorkHistory
        const result = await PUT(`/profile/history/${props.item!.id}`, data)
        if (result.error) {
          console.error("Error occurred while trying to update experience:")
          console.error(result.error)
        }

        if (props.onSuccess) props.onSuccess(value as TSavedWorkHistory)
      }
    }
  }))

  const handleSubmit = async () => {
    await form.handleSubmit()
    if (form.state.isValid) {
      props.toggleVisibility()
    }
  }

  return (
    <Modal subTitle="Work history" title={props.title}
      onClose={props.toggleVisibility}
      footer={(
        <ModalFooter>
          <Button onClick={() => props.toggleVisibility()} variant="outline" label="Cancel" />
          <Button onClick={() => handleSubmit()} variant="primary" label="Save entry" />
        </ModalFooter>
      )}>
      <form id="work-history-form" onSubmit={(e) => {
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
