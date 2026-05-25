import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/job.new";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { POST } from "~/lib/api";
import type { ApplicationStatus } from "~/types/api.types";

/*

type Application struct {
  ID          string `gorm:"primaryKey" json:"id"`
  Name        string `json:"name"`
  Company     string `json:"company"`
  Title       string `json:"job_title" gorm:"column:job_title"`
  Homepage    string `json:"homepage"`
  Link        string `json:"link"`
  Status      string `json:"status"`
  CreateDate  int64  `gorm:"column:create_date" json:"create_date"`
  Ad          string `json:"job_ad" gorm:"column:job_ad"`
  Application string `json:"job_application" gorm:"column:job_application"`
}

*/

type CreateJobPayload = {
  name: string;
  company: string;
  job_title: string;
  homepage: string;
  link: string;
  status: ApplicationStatus;
  job_ad?: string;
  job_application?: string;
}

type CreatedJobResponse = {
  id: string;
  create_date: number;
} & CreateJobPayload

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New Job Application" },
    { name: "description", content: "Create and save a new job application" },
  ];
}

const statusOptions: ApplicationStatus[] = [
  "saved",
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
];

type NewApplicationRes = {
  data: {
    application: CreatedJobResponse
  }
}

export default function NewJobRoute() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [homepage, setHomepage] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("saved");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: CreateJobPayload = {
      name: name.trim(),
      company: company.trim(),
      job_title: jobTitle.trim(),
      homepage: homepage.trim(),
      link: link.trim(),
      status
    };

    try {
      const response = await POST<NewApplicationRes>("/api/jobs", payload);
      navigate(`/application/${response.data.application.id}`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save job application");
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">New Job Application</h1>
        <Button asChild variant="outline">
          <Link to="/">Back</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Application title"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Frontend Engineer"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="homepage">Homepage URL</Label>
            <Input
              id="homepage"
              type="url"
              value={homepage}
              onChange={(e) => setHomepage(e.target.value)}
              placeholder="https://company.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link">Job Post URL</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://jobs.company.com/123"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button asChild type="button" variant="outline" disabled={submitting}>
            <Link to="/">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Saving..." : "Save Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
