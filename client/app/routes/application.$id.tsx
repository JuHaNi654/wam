import { useParams } from "react-router";
import type { Route } from "./+types/application.$id";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import useFetch from "~/hooks/useFetch";
import Loading from "~/components/loading";
import type { Action, Application, Skills } from "~/types/api.types";
import InlineEditText from "~/components/ui/edit/inline-edit";
import InlineEditDropdown from "~/components/ui/edit/dropdown-edit";
import InlineEditDropdownMega from "~/components/ui/edit/dropdown-edit-mega";
import Documents from "~/components/application/documents";
import Actions from "~/components/application/actions";
import { renderDate } from "~/lib/date";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Application Details" },
    { name: "description", content: "View and edit application details" },
  ];
}

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

type ApplicationResponse = {
  data: {
    application: Application,
    actions: Action[],
    skills: Skills[]
  }
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const { response, loading, error, refetch } = useFetch<ApplicationResponse>(`/api/jobs/${id}`);

  async function save(data: { [key: string]: string }) {
    console.log("Update")
    console.log(data)
  }
  async function saveAction(actionId: string, update: ActionPatchPayload) { }

  if (!id) {
    return <div>Invalid id</div>
  }

  return (
    <Loading isLoading={loading}>
      <div className="container mx-auto py-10 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Application Details</h1>
          <Button asChild variant="outline">
            <Link to="/">Back to Applications</Link>
          </Button>
        </div>

        {response && response.data && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <InlineEditText
                    label="Name" name="name"
                    value={response.data.application.name}
                    required onSave={save}
                    className="text-xl font-semibold"
                  />
                  <InlineEditText
                    label="Company" name="company"
                    value={response.data.application.company}
                    required onSave={save}
                    className="text-muted-foreground"
                  />
                  <InlineEditText
                    label="Job title" name="job_title"
                    value={response.data.application.job_title}
                    required onSave={save}
                    className="text-sm text-muted-foreground mt-1"
                  />
                </div>
                <InlineEditDropdown name="status" value={response.data.application.status}
                  onSave={save} options={statusOptions}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="font-medium">
                    {renderDate(response.data.application.create_date)}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Homepage</span>
                  <InlineEditText
                    label="Homepage" name="homepage"
                    value={response.data.application.homepage}
                    required onSave={save}
                    className="font-medium text-primary break-all"
                  />
                </div>

                <div>
                  <span className="text-muted-foreground">Link to application</span>
                  <InlineEditText
                    label="Link to application" name="link"
                    value={response.data.application.link}
                    required onSave={save}
                    className="font-medium text-primary break-all"
                  />
                </div>

              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground 
                uppercase tracking-wide">
                Skills
              </h3>
              <InlineEditDropdownMega values={response.data.skills} applicationId={id as string} />
            </div>
            <Documents application={response.data.application} />
            <Actions applicationId={response.data.application.id} actions={response.data.actions} />
          </div>
        )}

      </div>
    </Loading>
  )
}
