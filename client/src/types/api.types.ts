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

export type History = {
  id?: string;
  company: string;
  title: string;
  description: string;
  current: boolean;
  start_date: number;
  end_date: number;
}

export type Education = {
  id?: string;
  program: string;
  school: string;
  start_date: number;
  end_date: number;
}

export type AIAgentStatus = {
  name: string;
  model: string;
  size: number;
  digest: string;
  expires_at: string;
  size_vram: number;
  context_lengt: number;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: Array<string>;
    parameter_size: string;
    quantization_level: string;
  }
}
