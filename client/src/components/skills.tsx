import type { Skill } from "@/types/api.types"
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/lib/api";
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
import { Fragment, useEffect, useState } from "react";

type Props = {
  skills: Skill[];
  update(skills: Skill[]): void
}

export default function Skills(props: Props) {
  const anchor = useComboboxAnchor()
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(props.skills)

  useEffect(() => {
    setSelectedSkills(props.skills)
  }, [props.skills])

  const { data } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      return await GET<{ skills: Skill[] }>('/api/skills', null)
    },
    retry: 0,
  })


  return (
    <Combobox
      multiple
      autoHighlight
      items={data?.data.skills ?? []}
      value={selectedSkills}
      itemToStringLabel={(item) => item.name}
      itemToStringValue={(item) => item.id}
      isItemEqualToValue={(item, value) => item.id === value.id}
      onValueChange={(value) => {
        setSelectedSkills(value)
        props.update(value)
      }}
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
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
