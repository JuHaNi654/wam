import { useState } from "react";

type PropsInlineEditDropdown = {
  name: string;
  value: string;
  options: string[];
  onSave: (data: { [k: string]: string }) => Promise<void>;
}

export default function InlineEditDropdown(props: PropsInlineEditDropdown) {
  const [draft, setDraft] = useState<string>(props.value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commit = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    if (next === props.value) {
      return
    }

    try {
      setSaving(true)
      await props.onSave({ [props.name]: next })
    } catch (err: unknown) {
      setError("Failed to update status")
    } finally {
      setDraft(next)
      setSaving(false)
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <select autoFocus value={draft} disabled={saving} onChange={commit}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {props.options.map((option, i) => {
            return <option key={i} value={option}>{option}</option>
          })}
        </select>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
