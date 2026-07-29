export type APIResponse<T> = {
  status: number
  data?: T
}

export type APIErrorResponse = {
  status: number;
  message?: string;
  validation?: Array<PropertyError>
}

export type PropertyError = {
  property?: string;
  title?: string;
  message?: string;
}

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
  in_use: string;
  available: boolean;
}
