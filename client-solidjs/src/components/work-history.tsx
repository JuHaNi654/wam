import type { TApiResponse, TSavedWorkHistory, TWorkHistory } from "../models/models"
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
    <div class="flex flex-col gap-2 border rounded-lg border-gray-200 p-4">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide">Work history</h3>
        <button class="btn btn-soft" onClick={() => toggleTargetModal("new-history", true)}>
          <i class="ri-add-line"></i>
        </button>
        <Show when={showModal()["new-history"]}>
          <Portal>
            <FormWorkExperience onSuccess={saveWorkHistoryItem}
              action="create" toggleVisibility={() => toggleTargetModal("new-history", false)} />
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
                      <FormWorkExperience onSuccess={updateWorkHistoryItem}
                        action="update" toggleVisibility={() => toggleTargetModal(item.id, false)} item={item} />
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

type FormWorkExperienceProps = {
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
        console.log("Create workExp: ", result)
      } else {
        const { id, ...data } = value as TSavedWorkHistory
        const result = await PUT(`/profile/history/${props.item!.id}`, data)
        if (result.error) {
          console.error("Error occurred while trying to update experience:")
          console.error(result.error)
        }

        if (props.onSuccess) props.onSuccess(value as TSavedWorkHistory)
        console.log("update workExp: ", result)
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
    <Modal subTitle="Work history" title="New entry"
      onClose={props.toggleVisibility}
      footer={(
        <ModalFooter>
          <Button onClick={() => props.toggleVisibility()} variant="outline" label="Cancel" />
          <Button onClick={() => handleSubmit()} variant="primary" label="Save entry" />
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
