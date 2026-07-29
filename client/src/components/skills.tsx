import type { Skill } from "@/types/api.types"
import { useQuery } from "@tanstack/react-query";
import { GET, POST } from "@/lib/api";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Fragment, useState } from "react";
import { RiAddLine } from "@remixicon/react";
import { toast } from "sonner"

type Props = {
  skills: Skill[];
  update(skills: Skill[]): void
}

type ListView = {
  creatable?: boolean
} & Skill

function listItems(input: string, skills?: Array<Skill>): Array<ListView> {
  const transformed = input.trim().toLowerCase()
  if (transformed.length === 0) return skills as ListView[]

  const newItem: ListView = { name: input, creatable: true, id: `create:${transformed}` }
  if (!skills || skills.length === 0) return [newItem]

  const exists = skills.some((skill) => skill.name.toLowerCase().trim() === transformed)
  return exists ? skills : [newItem, ...skills]
}

export default function Skills(props: Props) {
  const anchor = useComboboxAnchor()
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(props.skills)
  const [inputValue, setInputValue] = useState("")
  const { data, isSuccess } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const result = await GET<Skill[]>('/api/skills', null)
      if (result.error) throw result.error
      return result.response?.data
    },
    retry: 0,
  })

  if (!isSuccess) return null

  const createNewTag = async (name: string) => {
    const result = await POST<Skill>('/api/skills', { name })
    if (result.error) {
      console.error(result.error)
      toast.error("Something went wrong, while trying to create new skill", { position: "bottom-right" })
      return
    }

    const skill = result.response?.data as Skill
    setSelectedSkills((prev) => [...prev, skill])
    props.update([...selectedSkills, skill])
  }

  const handleUpdate = async (items: Array<ListView | Skill>) => {
    const newSkill = items.find((item: ListView) => item.creatable)
    if (newSkill) {
      createNewTag(newSkill.name)
      return
    }

    setSelectedSkills(items)
    props.update(items)
  }

  return (
    <Combobox
      multiple
      autoHighlight
      items={listItems(inputValue, data)}
      value={selectedSkills}
      itemToStringLabel={(item) => item.name}
      itemToStringValue={(item) => item.id}
      isItemEqualToValue={(item, value) => item.id === value.id}
      onValueChange={(value) => handleUpdate(value)}
      onInputValueChange={setInputValue}
    >
      <ComboboxChips ref={anchor} className="w-full">
        <ComboboxValue>
          {(values) => (
            <Fragment>
              {values.map((value: Skill) => (
                <ComboboxChip key={value.id}>{value.name}</ComboboxChip>
              ))}
              <ComboboxChipsInput />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>
          No Results
        </ComboboxEmpty>
        <ComboboxList>
          {(item: ListView) => (
            !item.creatable ? (
              <ComboboxItem key={item.id} value={item}>
                {item.name}
              </ComboboxItem>
            ) : (
              <ComboboxItem key={item.id} value={item}>
                <span className="flex gap-2 items-center">
                  <RiAddLine />
                  Create ({item.name}) skill
                </span>
              </ComboboxItem>
            )
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
