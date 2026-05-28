import { useState } from "react"
import type { Skill } from "@/types/api.types"
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import EditButton from "./ui/edit/edit-button";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/lib/api";

type Props = {
  skills: Skill[];
  update(skills: Skill[]): void
}

export default function Skills(props: Props) {
  const { data } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      return await GET<{ skills: Skill[] }>('/api/skills', null)
    },
    retry: 0,
  })

  const [editing, setEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(props.skills || [])

  const toggleEdit = () => {
    setErrorMsg(null)
    setEditing(() => !editing)
  }

  const toggleItem = (item: Skill, selected: boolean) => {
    if (selected) setSelectedSkills([...selectedSkills, item])

    if (!selected) {
      const filtered = selectedSkills.filter((s) => s.id !== item.id)
      setSelectedSkills(filtered)
    }
  }

  const save = async () => {
    if (props.update) props.update(selectedSkills)
    toggleEdit()
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
                {data && data.data.skills.map((item) => (
                  <SkillInput key={item.id} skill={item} selected={selectedSkills} onChange={toggleItem} />
                ))}
              </div>
            </details>

            <div className="flex flex-wrap gap-2">
              <DisplayView values={selectedSkills} />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={toggleEdit} type="button" variant="outline">
                Cancel
              </Button>
              <Button type="button" onClick={save}>
                Save skills
              </Button>
            </div>
          </div>
        )}
        <EditButton label="Edit skills" onClick={toggleEdit} />
      </div>
      {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
    </div>
  )
}

type SkillInputProps = {
  skill: Skill,
  selected: Skill[]
  onChange: (item: Skill, selected: boolean) => void
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
  values: Skill[];
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
