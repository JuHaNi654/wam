import { createSignal, For, Show } from "solid-js"
import { actionSchema, TAction, TSavedAction } from "../models/models"
import { DeleteConfirmationDialog } from "./alert-dialog"
import { renderDate } from "../utils/date"
import { Modal, ModalFooter } from "./modal"
import { Button, IconButton } from "./elements/button"
import { Portal } from "solid-js/web"
import { createForm } from "@tanstack/solid-form"
import InputField from "./input/InputField";
import TextareaField from "./input/TextareaField";
import DateField from "./input/DateField";
import { DELETE, POST, PUT } from "../utils/api"
import { useParams } from "@tanstack/solid-router"
import { useToast } from "./toast"

type Props = {
  actions: Array<TSavedAction>
}

export default function Actions(props: Props) {
  const toast = useToast()
  const [actions, setActions] = createSignal(props.actions)
  const [showModal, setShowModal] = createSignal<{ [k: string]: boolean }>({})

  const toggleTargetModal = (id: string, value: boolean) => {
    setShowModal({ ...showModal(), [id]: value })
  }

  const handleDelete = async (id: string) => {
    const { error } = await DELETE(`/actions/${id}`, null)
    if (error) {
      toast.error({ message: "Error occurred while trying to delete action" })
      console.error(error)
      return
    }

    setActions(actions().filter((action) => action.id !== id))
    toast.success({ message: "Action entry deleted" })
  }

  const saveActionItem = (item: TSavedAction) => {
    setActions([...actions(), item])
  }

  const updateActionItem = (item: TSavedAction) => {
    setActions(actions().map((action) => action.id === item.id ? item : action))
  }

  return (
    <section class="ring-1 ring-white/20 bg-zinc-800 rounded-lg p-4">
      <header class="mb-3 flex justify-between items-center">
        <h3 class="text-sm font-semibold uppercase tracking-wide">Actions</h3>
        <IconButton icon="ri-add-line" size="sm" onClick={() => toggleTargetModal("new-action", true)} label="New action entry" />
        <Show when={showModal()["new-action"]}>
          <Portal>
            <FormAction onSuccess={saveActionItem} title="New entry"
              action="create" toggleVisibility={() => toggleTargetModal("new-action", false)} />
          </Portal>
        </Show>
      </header>
      <ul class="flex flex-col gap-4">
        <For each={actions()}>
          {(action) => (
            <li class="flex items-center gap-4 text-sm border-l-2 border-border pl-4">
              <span class="block">{renderDate(action.date)}</span>
              <h4 class="font-semibold">{action.title}</h4>
              <div class="flex gap-2 ml-auto">
                <IconButton label="View entry" icon="ri-eye-line" size="sm" onClick={() => toggleTargetModal(action.id, true)} />
                <Show when={showModal()[action.id]}>
                  <Portal>
                    <FormAction title="Update entry" item={action} onSuccess={updateActionItem}
                      action="update" toggleVisibility={() => toggleTargetModal(action.id, false)} />
                  </Portal>
                </Show>
                <DeleteConfirmationDialog id="delete-application"
                  title="Are you sure, you want to delete selected item"
                  description={`You are currently deleting (${action.title}).`}
                  onCancel={() => toggleTargetModal(action.id, false)}
                  onConfirmation={() => handleDelete(action.id)} />
              </div>
            </li>
          )}
        </For>
      </ul>
    </section>
  )
}

type FormActionProps = {
  title: string
  action: 'update' | 'create'
  item?: TSavedAction
  toggleVisibility: () => void
  onSuccess?: (item: TSavedAction) => void
}

const defaultActionValues: TAction = {
  title: "",
  note: "",
  date: 0
}

function FormAction(props: FormActionProps) {
  const toast = useToast()
  const applicationID = useParams({
    from: '/layout/applications/$applicationId',
    select: (params) => params.applicationId
  })

  const form = createForm(() => ({
    defaultValues: props.item || defaultActionValues,
    validators: {
      onSubmit: actionSchema
    },
    onSubmit: async ({ value }) => {
      if (props.action === 'create') {
        const result = await POST<TSavedAction>(`/applications/${applicationID()}/actions`, value)
        if (result.error) {
          toast.error({ message: "Error occurred while trying to create action" })
          console.error(result.error)
          return
        }

        if (props.onSuccess) props.onSuccess(result!.response!.data)
        toast.success({ message: "Action created" })
      } else {
        const { id, ...data } = value as TSavedAction
        const result = await PUT(`/actions/${id}`, data)
        if (result.error) {
          toast.error({ message: "Error occurred while trying to update action" })
          console.error(result.error)
          return
        }

        if (props.onSuccess) props.onSuccess(value as TSavedAction)
        toast.success({ message: "Action updated" })
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
    <Modal subTitle="Action" title={props.title}
      onClose={props.toggleVisibility}
      footer={(
        <ModalFooter>
          <Button onClick={() => props.toggleVisibility()} variant="outline" label="Cancel" />
          <Button onClick={handleSubmit} variant="primary" label="Save entry" />
        </ModalFooter>
      )}>
      <form id="action-form" onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}>
        <form.Field name="title"
          children={(field) => (
            <InputField label="Title" name={field().name}
              value={field().state.value}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
              errors={field().state.meta.errors.map((err) => err?.message || "")}
            />
          )} />

        <form.Field name="note"
          children={(field) => (
            <TextareaField label="Note" name={field().name}
              value={field().state.value}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
              errors={field().state.meta.errors.map((err) => err?.message || "")}
            />
          )} />

        <form.Field name="date"
          children={(field) => (
            <DateField label="Date" name={field().name} value={field().state.value}
              onChange={(e) => field().handleChange(e)}
              onBlur={field().handleBlur}
              errors={field().state.meta.errors.map((err) => err?.message || "")}
            />
          )} />

      </form>
    </Modal>
  )
}
