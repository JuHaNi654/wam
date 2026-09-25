import { Button, IconButton } from "./elements/button";

type Props = {
  id: string;
  title: string;
  description?: string;
  onConfirmation: () => void;
  onCancel?: () => void
}
export function DeleteConfirmationDialog(props: Props) {
  let element!: HTMLDialogElement

  return (
    <>
      <IconButton label="Delete application" size="sm"
        icon="ri-delete-bin-line" onClick={() => element.showModal()} />
      <dialog ref={element} id={props.id} class="modal">
        <div class="modal-box p-0 ring-1 ring-white/10 bg-zinc-800">
          <header class="p-4 border-b border-white/10 bg-muted/40">
            <h3 class="text-lg font-bold">{props.title}</h3>
          </header>
          <div class="modal-content p-4">
            {props.description && <p>{props.description}</p>}
          </div>
          <div class="modal-action">
            <form class="w-full flex justify-end gap-4 bg-zinc-900 py-4 px-6 border-t border-white/10" method="dialog">
              <Button variant="outline" onClick={() => props.onCancel && props.onCancel()} label="Cancel" />
              <Button variant="danger" onClick={() => props.onConfirmation()} label="Delete" />
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}
