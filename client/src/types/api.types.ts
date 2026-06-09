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
  position: string;
  homepage: string;
  link: string;
  status: ApplicationStatus;
  create_date: number;
  ad?: string;
  application?: string;
  skills: Skill[];
  actions: Action[];
};

export type Skill = {
  id: string;
  name: string;
};

export type Action = {
  id: string;
  title: string;
  note: string;
  date: number;
  application_id: string;
};

export type Profile = {
  id: string;
  introduction: string;
};

export type History = {
  id?: string;
  company: string;
  title: string;
  description?: string;
  start_date: number;
  end_date: number;
  current: boolean;
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
