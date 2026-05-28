import { useDialog } from "@/context/dialog-context";
import { Button } from "../ui/button";
import type { Application } from "@/types/api.types";

type DocumentProps = {
  content?: string | null
}
function Document(props: DocumentProps) {
  return (
    <div className="space-y-3 h-full">
      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
        {props.content && props.content.length > 0 ? props.content : "No content yet."}
      </div>
    </div>
  )
}

type DocumentsProps = {
  application: Application
}

export default function Documents(props: DocumentsProps) {
  const { openDialog } = useDialog()

  const showDocument = (id: string, title: string) => {
    openDialog({
      id, title,
      children: (<Document content={props.application.job_ad} />),
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
        <Button variant="outline" onClick={() => showDocument('job-ad', "Job ad")}>View Job ad</Button>
      </div>
    </div>
  )
}
