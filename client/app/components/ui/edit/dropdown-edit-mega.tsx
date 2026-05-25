import { useState } from "react";
import { Badge } from "../badge";
import EditButton from "./edit-button";
import { Input } from "../input";
import { Button } from "../button";
import useFetch from "~/hooks/useFetch";
import type { Skills } from "~/types/api.types";
import { POST } from "~/lib/api";

type Props = {
  applicationId: string;
  values: Skills[];
}


type GetSkillsResponse = {
  data: {
    skills: Skills[]
  }
}

type NewSkillResponse = {
  data: {
    skill: Skills
  }
}

export default function InlineSkillsEdit(props: Props) {
  const { response, refetch } = useFetch<GetSkillsResponse>('/api/skills')
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Skills[]>(props.values || [])
  const [newSkill, setNewSkill] = useState("");

  const toggleEdit = async () => {
    setErrorMsg(null)
    setNewSkill("")
    setEditing(() => !editing)
  }

  const saveNewSkill = async () => {
    try {
      // Make server request for saving new skill
      const created = await POST<NewSkillResponse>("/api/skills", {
        name: newSkill
      })

      setSelectedSkills([...selectedSkills, created.data.skill])
      refetch()
    } catch (err: unknown) {
      console.log(err)
      setErrorMsg("Cannot create new skill")
    }
  }

  const toggleItem = (item: Skills, selected: boolean) => {
    if (selected) setSelectedSkills([...selectedSkills, item])

    if (!selected) {
      const filtered = selectedSkills.filter((s) => s.id !== item.id)
      setSelectedSkills(filtered)
    }
  }

  const save = async () => {
    const payload: any = {
      skills: selectedSkills
    };

    try {
      const saved = await POST<any>(`/api/jobs/${props.applicationId}/skills`, payload);
      console.log("Saved skills: ", saved)
    } catch (err: any) {
      console.log(err)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        {!editing && <DisplayView values={selectedSkills} />}
        {editing && (
          <div className="flex-1 space-y-3">
            <details className="rounded-md border border-input bg-background">
              <summary className="cursor-pointer select-none p-3 text-sm font-medium">
                Select skills ({selectedSkills.length} selected)
              </summary>
              <div className="border-t border-input p-3 max-h-48 overflow-y-auto space-y-2">
                {response && response.data.skills.map((item) => (
                  <SkillInput key={item.id} skill={item} selected={selectedSkills} onChange={toggleItem} />
                ))}
              </div>
            </details>

            {/*
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add new skill" disabled={saving} />
              <Button type="button" variant="outline" onClick={saveNewSkill} disabled={saving}>
                Add
              </Button>
            </div>
            */}

            <div className="flex flex-wrap gap-2">
              <DisplayView values={selectedSkills} />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={toggleEdit} type="button"
                variant="outline" disabled={saving} >
                Cancel
              </Button>
              <Button type="button" onClick={save} disabled={saving}>
                {saving ? "Saving ..." : "Save skills"}
              </Button>
            </div>
          </div>
        )}
        <EditButton label="Edit skills" onClick={toggleEdit} disabled={saving} />
      </div>
      {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
    </div>
  )
}

type SkillInputProps = {
  skill: Skills,
  selected: Skills[]
  onChange: (item: Skills, selected: boolean) => void
}
function SkillInput(props: SkillInputProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input value={props.skill.id} onChange={(e) => props.onChange(props.skill, e.target.checked)}
        type="checkbox" checked={props.selected.some((s) => s.id === props.skill.id)} />
      <span>{props.skill.name}</span>
    </label>
  )
}

type DisplayViewProps = {
  values: Skills[];
}
function DisplayView(props: DisplayViewProps) {
  if (props.values.length === 0) {
    return <p className="text-sm text-muted-foreground">No skills added</p>
  }

  return (
    <div className="flex flex-wrap gap-2 flex-1">
      {props.values.map((value) => (
        <Badge key={value.id} variant={"secondary"}>
          {value.name}
        </Badge>
      ))}
    </div>
  )
}
