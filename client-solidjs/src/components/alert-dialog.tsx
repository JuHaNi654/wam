
type Props = {
  id: string;
  title: string;
  description?: string;
  onConfirmation: () => void;
  onCancel: () => void
}
export function DeleteConfirmationDialog(props: Props) {
  let element!: HTMLDialogElement

  return (
    <>
      <button onClick={() => element.showModal()} class="btn btn-soft">
        <i class="ri-delete-bin-line"></i>
      </button>
      <dialog ref={element} id={props.id} class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-bold">{props.title}</h3>
          {props.description && <p>{props.description}</p>}
          <div class="modal-action">
            <form class="flex gap-4" method="dialog">
              <button onClick={() => props.onCancel()}>Cancel</button>
              <button onclick={() => props.onConfirmation()}>Delete</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}
