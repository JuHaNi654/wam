import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import Loading from "@/components/loading";
import type { Action, Application, Skill } from "@/types/api.types";
import InlineEditDropdown from "../components/ui/edit/dropdown-edit";
import Documents from "@/components/application/documents";
import Actions from "@/components/application/actions";
import { renderDate } from "@/lib/date";
import Base from "@/components/base";
import Skills from "@/components/skills";
import { GET, POST } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface ActionPatchPayload {
  title?: string;
  date?: string;
  note?: string | null;
  description?: string | null;
}

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
  actions: Action[],
  skills: Skill[]
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["application"],
    queryFn: async () => {
      return await GET<ApplicationDetails>(`/api/jobs/${id}`, null)
    },
    retry: 0,
  })

  async function save(data: { [key: string]: string }) {
    console.log("Update")
    console.log(data)
  }
  async function saveAction(actionId: string, update: ActionPatchPayload) { }

  const saveSkills = async (skills: Skill[]) => {
    try {
      await POST<any>(`/api/jobs/${data?.data.application.id}/skills`, { skills })
    } catch (err) {
      console.log("Something went wrong while trying to save skills")
      console.log(err)
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
                <span className="block text-muted-foreground">{data.data.application.job_title}</span>
              </header>

              <div className="flex flex-col gap-2 border rounded-lg border-gray-200 p-4">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground 
                uppercase tracking-wide">
                  Skills
                </h3>
                <Skills skills={data.data.skills} update={saveSkills} />
              </div>

              <Documents application={data.data.application} />
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
