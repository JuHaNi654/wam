import { createSignal } from "solid-js";
import { IconButton } from "./elements/button";

const defaultText = "Text not set..."

type Props = {
  name: string;
  label: string;
  text?: string;
  handleSave: (item: { [k: string]: any }) => void;
}
export default function ToggleEdit(props: Props) {
  const [edit, setEdit] = createSignal(false)
  const [text, setText] = createSignal(props.text || defaultText)

  return (
    <section class="flex flex-col gap-2 rounded-lg p-4 bg-zinc-800">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide">{props.label}</h3>
        <IconButton icon="ri-pencil-line" size="sm" onClick={() => setEdit(true)} label="Edit introduction" />
      </header>

      <div class="text-xs flex flex-col gap-2 min-h-10">
        {!edit() && <div class="whitespace-pre-wrap">{text()}</div>}

        {edit() && (
          <>
            <textarea name={props.name} class="textarea w-full" rows={10} value={text()} onChange={(e) => setText(e.currentTarget.value)} />
            <div class="flex gap-2 justify-end">
              <button onClick={() => setEdit(false)} class="btn btn-soft">Cancel</button>
              <button onClick={() => {
                props.handleSave({ [props.name]: text() })
                setEdit(false)
              }} class="btn btn-soft">Save</button>
            </div>
          </>
        )}

      </div>
    </section>
  )
}
