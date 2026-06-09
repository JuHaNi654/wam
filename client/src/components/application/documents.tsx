import { useDialog } from "@/context/dialog-context";
import { Button } from "../ui/button";
import type { Application } from "@/types/api.types";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

type DocumentProps = {
  editable?: boolean
  content?: string
  update?: (content: string) => void
}
function Document(props: DocumentProps) {
  const [content, setContent] = useState(props.content ?? "No content yet")

  if (!props.editable) {
    return (
      <div className="space-y-3 h-full flex flex-col">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed flex-1">
          {content}
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (props.update) props.update(content)
  }

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed flex-1">
        <Textarea className="h-full" rows={10} value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button variant="default" onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}

type DocumentsProps = {
  application: Application
}

export default function Documents(props: DocumentsProps) {
  const { openDialog } = useDialog()

  const handleSave = async (application: string) => {
    try {
      console.log("Application: ", application)
    } catch (err) {
      console.log(err)
    }
  }

  const showAd = () => {
    openDialog({
      id: "job-ad",
      title: "Job ad",
      children: (<Document content={props.application.ad} />),
      width: 560,
      height: 480
    })
  }


  const showApplication = () => {
    openDialog({
      id: "job-application",
      title: "Job application",
      children: (<Document update={handleSave} content={props.application.application} editable />),
      width: 560,
      height: 480
    })
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground 
        uppercase tracking-wide">
        Documents
      </h3>
      <div className="flex gap-3">
        <Button variant="outline" onClick={showAd}>View Job ad</Button>
        <Button variant="outline" onClick={showApplication}>View Job application</Button>
      </div>
    </div>
  )
}
