export type NotificationType = string
export const NotificationLLMStatusChange: NotificationType = "llm-status-change"
export const NotificationLLMModelEnabled: NotificationType = "llm-model-enabled"

export type NotificationPayload<T> = {
  type: NotificationType
  content: T
}

export type LlamaStatusEvent = {
  model: string;
  event: string;
  data: {
    status: string;
  }
}
