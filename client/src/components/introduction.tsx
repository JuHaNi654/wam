import { useState } from "react"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { RiEditLine } from "@remixicon/react"
import { PUT } from "@/lib/api"

const default_introduction = "Currently any of the introduction is not set"

type Props = {
  introduction?: string
}
export default function Introduction(props: Props) {
  const [edit, setEdit] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [introduction, setIntroduction] = useState<string | undefined>(props.introduction || default_introduction)

  const save = async () => {
    setDisabled(true)
    try {
      const body = { introduction }
      console.log(body)

      await PUT("/api/profile", body)
    } catch (err) {
      console.log(err)
    } finally {
      setDisabled(false)
      setEdit(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 border rounded-lg border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Work history</h3>
        <Button variant="outline" size="sm" onClick={() => setEdit(true)}>
          <RiEditLine />
        </Button>
      </div>
      <div className="text-xs flex flex-col gap-2">
        <div className="cursor-pointer min-h-10">
          {edit ? (
            <div>
              <Textarea rows={10} value={introduction} onChange={(e) => setIntroduction(e.target.value)} />
            </div>
          ) : <div className="whitespace-pre-wrap">{introduction}</div>}
        </div>

        {edit && (
          <div className="flex gap-2 justify-end">
            <Button disabled={disabled} type="button" variant="outline" onClick={() => setEdit(false)} >
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={disabled}>
              Submit
            </Button>
          </div>
        )}
      </div>

    </div>
  )
}
