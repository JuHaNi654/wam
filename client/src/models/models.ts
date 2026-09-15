import * as z from "zod"

// Custom types 
const dateInUnix = (label: string) => {
  return z.number()
    .int(`${label} must be a unix timestamp in seconds`)
    .nonnegative(`${label} must be a unix timestamp in seconds`)
    .refine((value) => value !== 0, {
      message: `${label} is required`,
    })
}

// Server types
export type TApiResponse<T> = T extends void
  ? { status: number }
  : { status: number; data: T }

export type TApiErrorResponse = {
  status: number;
  message?: string;
  validation?: Array<TPropertyError>
}

export type TPropertyError = {
  property?: string;
  title?: string;
  message?: string;
}

export type TApiResult<T> = {
  response: TApiResponse<T> | null
  error: TApiErrorResponse | null
}

// Application types
export const ApplicationStatus = {
  Saved: "saved",
  Applied: "applied",
  Interviewing: "interviewing",
  Offered: "offered",
  Rejected: "rejected",
  Withdrawn: "withdrawn"
} as const

const ApplicationStatusEnum = z.enum(ApplicationStatus)
export const applicationSchema = z.object({
  name: z.string().nonempty(),
  company: z.string().nonempty(),
  position: z.string().nonempty(),
  homepage: z.string().nonempty(),
  link: z.string().nonempty(),
  status: ApplicationStatusEnum
})

export type TApplication = z.infer<typeof applicationSchema>
export type TSavedApplication = {
  id: string;
  create_date: number;
  ad?: string;
  application?: string;
} & TApplication

// Skill types
export type TSkill = {
  id: string;
  name: string;
}

// Action types
export const actionSchema = z.object({
  title: z.string().nonempty(),
  note: z.string().nonempty(),
  date: dateInUnix("Date")
})

export type TAction = z.infer<typeof actionSchema>
export type TSavedAction = {
  id: string;
  application_id: string;
} & TAction

// Profile types
export type TProfile = {
  id: string;
  introduction: string;
}

// History types
export const workHistorySchema = z.object({
  company: z.string().nonempty(),
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  start_date: dateInUnix("Start date"),
  end_date: dateInUnix("End date"),
  current: z.boolean()
})

export type TWorkHistory = z.infer<typeof workHistorySchema>
export type TSavedWorkHistory = {
  id: string;
} & TWorkHistory

// Education
export const educationSchema = z.object({
  school: z.string().nonempty(),
  program: z.string().nonempty(),
  start_date: dateInUnix("Start date"),
  end_date: dateInUnix("End date"),
})

export type TEducation = z.infer<typeof educationSchema>
export type TSavedEducation = {
  id: string;
} & TEducation

// Settings 
export type TScrapeTarget = {
  url: string
  class: string
}

// LLM
export type TProviderModels = {
  provider: TProvider
  models: Array<TModel>
}

export type TProvider = {
  name: string;
  addr: string;
  available: boolean;
}

export type TModel = {
  id: string;
  status: string;
}

export type TModelResponse = {
  models: TModel[];
  provider: string;
  in_use: string;
}

// Notifications 
export type TNotificationType = string
export const NotificationLLMStatusChange: TNotificationType = "llm-status-change"
export const NotificationLLMModelEnabled: TNotificationType = "llm-model-enabled"

export type TNotificationPayload<T> = {
  type: TNotificationType
  content: T
}

export type TLlamaStatusEvent = {
  model: string;
  event: string;
  provider: string;
  data: {
    status: string;
  }
}

export type TModelToggleEvent = {
  model: string
}
