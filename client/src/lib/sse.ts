class Notifications {
  static #instance: Notifications | null = null
  #eventSrc: EventSource | null = null

  constructor() {
    if (Notifications.#instance) {
      return Notifications.#instance
    }

    Notifications.#instance = this
  }

  static getInstance() {
    return (Notifications.#instance ??= new Notifications)
  }

  #onMessage = (event: MessageEvent<any>) => {
    console.log("Incoming event: ", event)
  }

  #onError = (event: Event) => {
    console.log("Event error: ", event)
  }

  connect(url: string) {
    console.log("Connecting notifications: ", url)
    this.#eventSrc = new EventSource(url)
    this.#eventSrc.onmessage = this.#onMessage
    this.#eventSrc.onerror = this.#onError
  }
}

export default new Notifications()
