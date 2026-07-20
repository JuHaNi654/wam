class Notification {
  static #instance: Notification | null = null
  #eventSrc: EventSource | null = null

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
    console.log("Incoming event: ", event)
  }

  #onError = (event: Event) => {
    console.log("Event error: ", event)
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
