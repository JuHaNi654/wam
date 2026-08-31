import type { NotificationPayload } from "@/types/notification.types";


type Listener<T> = (event: NotificationPayload<T>) => void

class Notification {
  static #instance: Notification | null = null
  #eventSrc: EventSource | null = null
  #listeners: Set<Listener<any>> = new Set()
  #url: string | null = null
  #reconnectTimer: ReturnType<typeof setTimeout> | null = null
  #retryCount = 0
  #isUnmounted = false

  constructor() {
    if (Notification.#instance) {
      return Notification.#instance
    }

    Notification.#instance = this
  }

  static getInstance() {
    return (Notification.#instance ??= new Notification)
  }

  #clearReconnectTimer() {
    if (!this.#reconnectTimer) return
    clearTimeout(this.#reconnectTimer)
    this.#reconnectTimer = null
  }

  #cleanupEventSource() {
    if (!this.#eventSrc) return
    this.#eventSrc.onopen = null
    this.#eventSrc.onmessage = null
    this.#eventSrc.onerror = null
    this.#eventSrc.close()
    this.#eventSrc = null
  }

  #scheduleReconnect() {
    if (this.#isUnmounted || !this.#url || this.#reconnectTimer) return
    const delay = Math.min(1000 * 2 ** this.#retryCount, 10000)
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null
      this.#retryCount += 1
      this.#connect()
    }, delay)
  }

  #onOpen = () => {
    this.#retryCount = 0
  }

  #onMessage = (event: MessageEvent<any>) => {
    try {
      const data = JSON.parse(event.data) as NotificationPayload<any>
      this.#listeners.forEach((fn) => fn(data))
    } catch (err) {
      console.error("Invalid SSE message payload", err)
    }
  }

  #onError = (event: Event) => {
    console.log("Event error: ", event)
    this.#cleanupEventSource()
    this.#scheduleReconnect()
  }

  #connect() {
    if (!this.#url) return
    if (
      this.#eventSrc &&
      (this.#eventSrc.readyState === EventSource.OPEN ||
      this.#eventSrc.readyState === EventSource.CONNECTING)
    ) {
      return
    }

    this.#cleanupEventSource()
    this.#eventSrc = new EventSource(this.#url)
    this.#eventSrc.onopen = this.#onOpen
    this.#eventSrc.onmessage = this.#onMessage
    this.#eventSrc.onerror = this.#onError
  }

  subscribe<T>(fn: Listener<T>) {
    this.#listeners.add(fn)
    return () => this.#listeners.delete(fn)
  }

  mount(url: string) {
    if (!url) return

    this.#isUnmounted = false
    this.#clearReconnectTimer()

    if (this.#url !== url) {
      this.#url = url
      this.#retryCount = 0
      this.#cleanupEventSource()
    }

    this.#connect()
  }

  unmount() {
    this.#isUnmounted = true
    this.#clearReconnectTimer()
    this.#cleanupEventSource()
    this.#url = null
    this.#retryCount = 0
  }
}

export default new Notification()
