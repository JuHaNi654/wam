import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { POST } from "@/lib/api";
import type { ApplicationStatus } from "@/types/api.types";
import Base from "@/components/base";


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

const statusOptions: ApplicationStatus[] = [
  "saved",
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
];

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
      const response = await POST<{ application: CreatedJobResponse }>("/api/jobs", payload);
      navigate(`/application/${response.data.application.id}`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save job application");
      setSubmitting(false);
    }
  }

  return (
    <Base className="flex flex-col gap-4" showMenu>
      <header className="py-4 font-semibold">
        <h1 className="text-4xl">New Job Application</h1>
      </header>
      <div className="border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleSubmit}>
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

          <div className="flex justify-end gap-2 mt-4">
            <Button asChild type="button" variant="outline" disabled={submitting}>
              <Link to="/">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Saving..." : "Save Application"}
            </Button>
          </div>
        </form>

      </div>
    </Base>
  )
}
