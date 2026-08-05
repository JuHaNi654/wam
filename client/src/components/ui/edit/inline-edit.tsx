import { useState } from "react";
import { Input } from "../input";
import EditButton from "./edit-button";

type EditTextProps = {
  label: string;
  name: string
  value: string;
  onSave: (data: { [key: string]: string }) => Promise<void>;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "url" | "date";
  className?: string;
}

export default function InlineEditText(props: EditTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(props.value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEdit = () => {
    setError(null)
    setDraft(props.value)
    setEditing(() => !editing)
  }

  const commit = async () => {
    const normalized = draft.trim()
    if (props.required && normalized.length === 0) {
      setError(`${props.label} is required`)
      return
    }

    if (normalized === props.value || !props.required && normalized.length === 0) {
      setEditing(false)
      return
    }

    try {
      setSaving(true)
      setError(null)
      await props.onSave({ [props.name]: normalized })
      setEditing(false)
    } catch (_) {
      setError(`Failed to save ${props.label}`)
    } finally {
      setSaving(false)
    }
  }

  const oneKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Escape":
        e.preventDefault()
        toggleEdit()
        break
      case 'Enter':
        e.preventDefault()
        await commit()
        break
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {editing && (
          <Input
            autoFocus type={props.type} value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit} onKeyDown={oneKeyDown}
            placeholder={props.placeholder} disabled={saving}
          />
        )}
        {!editing && (
          <span className={props.className ?? "text-sm"}>{props.value}</span>
        )}
        <EditButton label={`Edit ${props.label}`} onClick={toggleEdit} disabled={saving} />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div >
  )

}
