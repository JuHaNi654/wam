import { Button } from "./ui/button";
import type { Application } from "@/types/api.types";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { createPortal } from "react-dom";
import Modal from "./modal";

type DocumentProps = {
  name?: string
  editable?: boolean
  content?: string
  update?: (content: { [key: string]: string }) => void
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
    if (props.update && props.name) props.update({ [props.name]: content })
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
  onUpdate: (data: { [key: string]: string }) => void
}

export default function Documents(props: DocumentsProps) {
  const [showAd, setShowAd] = useState(false)
  const [showApplication, setShowApplication] = useState(false)

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground 
        uppercase tracking-wide">
        Documents
      </h3>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowAd(true)}>View Job ad</Button>
        {showAd && createPortal(
          <Modal onClose={() => setShowAd(false)} title="Job ad">
            <Document content={props.application.ad} />
          </Modal>, document.body
        )}
        <Button variant="outline" onClick={() => setShowApplication(true)}>View Job application</Button>
        {showApplication && createPortal(
          <Modal onClose={() => setShowApplication(false)} title="Job application">
            <Document name="application" update={props.onUpdate} content={props.application.application} editable />
          </Modal>, document.body
        )}
      </div>
    </div>
  )
}
