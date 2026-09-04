import { createSignal } from "solid-js";

const defaultText = "Text not set..."

type Props = {
  label: string;
  text?: string;
  handleSave: (text: string) => void;
}
export default function ToggleEdit(props: Props) {
  const [edit, setEdit] = createSignal(false)
  const [text, setText] = createSignal(props.text || defaultText)

  return (
    <section class="flex flex-col gap-2 border rounded-lg border-gray-200 p-4">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide">{props.label}</h3>
        <button onClick={() => setEdit(true)} class="btn btn-soft">
          <i class="ri-edit-line"></i>
        </button>
      </header>

      <div class="text-xs flex flex-col gap-2 min-h-10">
        {!edit() && <div class="whitespace-pre-wrap">{text()}</div>}

        {edit() && (
          <>
            <textarea class="textarea w-full" rows={10} value={text()} onChange={(e) => setText(e.currentTarget.value)} />
            <div class="flex gap-2 justify-end">
              <button onClick={() => setEdit(false)} class="btn btn-soft">Cancel</button>
              <button onClick={() => props.handleSave(text())} class="btn btn-soft">Save</button>
            </div>
          </>
        )}

      </div>
    </section>
  )
}
