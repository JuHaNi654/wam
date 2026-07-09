import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import Loading from "@/components/loading";
import type { Application, Skill } from "@/types/api.types";
import InlineEditDropdown from "../components/ui/edit/dropdown-edit";
import Documents from "@/components/application/documents";
import Actions from "@/components/application/actions";
import { renderDate } from "@/lib/date";
import Base from "@/components/base";
import Skills from "@/components/skills";
import { GET, POST, PUT } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useDialog } from "@/context/dialog-context";
import { useState } from "react";
import { toast } from "sonner"
import type { SavedAction } from "@/components/form/action";

const statusOptions: string[] = [
  "saved",
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
];

type ApplicationDetails = {
  application: Application,
  actions: SavedAction[],
  skills?: Skill[]
}

export default function ApplicationDetail() {
  const { openDialog } = useDialog()
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["application"],
    queryFn: async () => {
      return await GET<ApplicationDetails>(`/api/applications/${id}`, null)
    },
    retry: 0,
  })

  async function save(obj: { [key: string]: string }) {
    try {
      await PUT(`/api/applications/${data?.data.application.id}`, obj)
      toast.success("Application updated", { position: "bottom-right" })
    } catch (err: any) {
      console.error(err)
      toast.error("Something went wrong while trying to save application", { position: "bottom-right" })
    }
  }

  const saveSkills = async (skills: Skill[]) => {
    try {
      await POST<any>(`/api/applications/${data?.data.application.id}/skills`, { skills })
    } catch (err) {
      toast.error("Something went wrong while trying to update skills", { position: "bottom-right" })
      console.error(err)
    }
  }

  return (
    <Base className="flex flex-col gap-4">
      <header className="py-4 flex items-center justify-between">
        <Button asChild variant="outline">
          <Link to="/dashboard">Back</Link>
        </Button>
      </header>
      <Loading isLoading={isLoading}>
        {data && data.data && (
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-9 flex flex-col gap-6">
              <header>
                <InlineEditDropdown name="status" value={data.data.application.status}
                  onSave={save} options={statusOptions}
                />
                <h1 className="text-3xl mt-4">{data.data.application.name}</h1>
                <span className="block text-muted-foreground">{data.data.application.position}</span>
              </header>

              <div className="flex flex-col gap-2 border rounded-lg border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground 
                  uppercase tracking-wide">
                    Skills
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => {
                    openDialog({
                      id: "agent-skills",
                      title: "Generate list of skills",
                      children: <AISkill applicationID={data.data.application.id} />,
                      width: 420,
                      height: 380
                    })
                  }}>
                    AI
                  </Button>

                </div>
                <Skills skills={data.data.skills || []} update={saveSkills} />
              </div>

              <Documents onUpdate={save} application={data.data.application} />
              <Actions applicationId={data.data.application.id} actions={data.data.actions} />
            </div>
            <div className="flex flex-col col-span-3 gap-2 border rounded-lg border-gray-200 p-4">
              <h2 className="uppercase text-md font-semibold">Details</h2>
              <div>
                <span className="text-md">Created</span>
                <p className="text-sm text-muted-foreground">
                  {renderDate(data.data.application.create_date)}
                </p>
              </div>
              <div>
                <span className="text-md">Company</span>
                <p className="text-sm text-muted-foreground">
                  {data.data.application.company}
                </p>
              </div>
              <div>
                <span className="text-md">Homepage</span>
                <a href={data.data.application.homepage} target="_blank" className="block text-sm text-muted-foreground hover:underline">
                  {data.data.application.homepage}
                </a>
              </div>
              <div>
                <span className="text-md">Job post</span>
                <a href={data.data.application.link} target="_blank" className="block text-sm text-muted-foreground hover:underline">
                  {data.data.application.link}
                </a>
              </div>
            </div>
          </section>
        )}
      </Loading>
    </Base>
  )
}

type AISkillProps = {
  applicationID: string
}
type AIResponse = {
  skills: string[]
}

function AISkill(props: AISkillProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [skills, setSkills] = useState<Array<string>>([])

  const generate = async () => {
    setIsLoading(true)
    try {
      const response = await GET<AIResponse>(`/api/llm/agent/hardskills?applicationId=${props.applicationID}`, null)
      setSkills(response.data.skills)
    } catch (err: any) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button size="sm" onClick={generate}>
          Generate
        </Button>
      </div>
      <Loading isLoading={isLoading}>
        <div>
          <h3 className="font-bold">Result:</h3>
          <ul className="flex flex-wrap gap-2 mt-1 text-sm">
            {skills.map((skill) => (
              <li key={skill} className="border border-gray-200 px-2 rounded">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </Loading>
    </div>
  )
}
