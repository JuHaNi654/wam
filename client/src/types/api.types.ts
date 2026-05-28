export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offered"
  | "rejected"
  | "withdrawn";

export type ApplicationListing = {
  id: string;
  name: string;
  company: string;
  status: ApplicationStatus;
  create_date: number;
};

export type Application = {
  id: string;
  name: string;
  company: string;
  status: ApplicationStatus;
  create_date: number;
  homepage: string;
  job_ad: string | null;
  job_application: string | null;
  job_title: string;
  link: string;
  skills: Skill[];
  actions: Action[];
};

export type Skill = {
  id: string;
  name: string;
};

export type Action = {
  id: string;
  job_id: string;
  note: string | null;
  date: number;
  title: string;
};

export type Profile = {
  id: string;
  introduction: string;
};
