import { createSignal, For, Show } from "solid-js"
import { TSavedAction } from "../models/models"
import { DeleteConfirmationDialog } from "./alert-dialog"
import { renderDate } from "../utils/date"
import { Modal, ModalFooter } from "./modal"
import { Button } from "./elements/button"
import { Portal } from "solid-js/web"

type Props = {
  actions: Array<TSavedAction>
}

export default function Actions(props: Props) {
  const [showModal, setShowModal] = createSignal<{ [k: string]: boolean }>({})

  const toggleTargetModal = (id: string, value: boolean) => {
    setShowModal({ ...showModal(), [id]: value })
  }

  return (
    <section class="ring-1 ring-white/20 bg-zinc-800 rounded-lg p-4">
      <header class="mb-3 flex justify-between items-center">
        <h3 class="text-md font-display font-semibold uppercase tracking-wide">Actions</h3>
        <button class="btn btn-soft" onClick={() => toggleTargetModal("new-action", true)}>
          <i class="ri-add-line"></i>
        </button>
        <Show when={showModal()["new-action"]}>
          <Portal>
            <FormAction onSuccess={() => { }} title="New entry"
              action="create" toggleVisibility={() => toggleTargetModal("new-action", false)} />
          </Portal>
        </Show>
      </header>
      <ul class="flex flex-col gap-4">
        <For each={props.actions}>
          {(action) => (
            <li class="flex items-center gap-4 text-sm border-l-2 border-border pl-4">
              <span class="block">{renderDate(action.date)}</span>
              <h4 class="font-semibold">{action.title}</h4>
              <div class="flex gap-2 ml-auto">
                <button class="btn btn-soft" onClick={() => toggleTargetModal(action.id, true)}>
                  <i class="ri-eye-line"></i>
                </button>
                <Show when={showModal()[action.id]}>
                  <Portal>
                    <FormAction title="Update entry" item={action} onSuccess={() => { }}
                      action="update" toggleVisibility={() => toggleTargetModal(action.id, false)} />
                  </Portal>
                </Show>
                <DeleteConfirmationDialog id="delete-application"
                  title="Are you sure, you want to delete selected item"
                  description={`You are currently deleting (${action.title}).`}
                  onCancel={() => { }} onConfirmation={() => { }} />
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
function FormAction(props: FormActionProps) {
  return (
    <Modal subTitle="Action" title={props.title}
      onClose={props.toggleVisibility}
      footer={(
        <ModalFooter>
          <Button onClick={() => props.toggleVisibility()} variant="outline" label="Cancel" />
          <Button onClick={() => { }} variant="primary" label="Save entry" />
        </ModalFooter>
      )}>
      <p>placeholder</p>
    </Modal>
  )
}
