import type { NotificationPayload } from "@/types/notification.types";


type Listener<T> = (event: NotificationPayload<T>) => void

class Notification {
  static #instance: Notification | null = null
  #eventSrc: EventSource | null = null
  #listeners: Set<Listener<any>> = new Set()

  constructor() {
    if (Notification.#instance) {
      return Notification.#instance
    }

    Notification.#instance = this
  }

  static getInstance() {
    return (Notification.#instance ??= new Notification)
  }

  #onMessage = (event: MessageEvent<any>) => {
    const data = JSON.parse(event.data) as NotificationPayload<any>
    this.#listeners.forEach((fn) => fn(data))
  }

  #onError = (event: Event) => {
    console.log("Event error: ", event)
  }

  subscribe<T>(fn: Listener<T>) {
    this.#listeners.add(fn)
    return () => this.#listeners.delete(fn)
  }

  mount(url: string) {
    console.log("Connecting notifications: ", url)
    this.#eventSrc = new EventSource(url)
    this.#eventSrc.onmessage = this.#onMessage
    this.#eventSrc.onerror = this.#onError
  }

  unmount() {
    if (!this.#eventSrc) return;
    this.#eventSrc.close()
  }
}

export default new Notification()
