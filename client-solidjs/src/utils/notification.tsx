import { createContext, useContext, onMount, onCleanup, type JSX } from "solid-js"
import type { TNotificationPayload, TNotificationType } from "../models/models"

type Listener<T> = (event: TNotificationPayload<T>) => void

// Framework-agnostic SSE connection manager. Owns exactly one EventSource
// and fans messages out to whoever has subscribed. Instances of this class
// are created and torn down by <NotificationProvider>, so its lifetime is
// tied to Solid's ownership tree instead of being a bare module-level
// singleton.
class NotificationClient {
  #eventSrc: EventSource | null = null
  #listeners: Set<Listener<any>> = new Set()
  #url: string | null = null
  #reconnectTimer: ReturnType<typeof setTimeout> | null = null
  #retryCount = 0
  #isUnmounted = false

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
      const data = JSON.parse(event.data) as TNotificationPayload<any>
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

const NotificationContext = createContext<NotificationClient>()

type NotificationProviderProps = {
  url: string
  children: JSX.Element
}

// Mount this once, at the root of the app. It owns the single EventSource
// connection for the whole tree: connects on mount, reconnects on error,
// and tears everything down when the provider itself is unmounted.
export function NotificationProvider(props: NotificationProviderProps) {
  const client = new NotificationClient()

  onMount(() => client.mount(props.url))
  onCleanup(() => client.unmount())

  return (
    <NotificationContext.Provider value={client}>
      {props.children}
    </NotificationContext.Provider>
  )
}

// Escape hatch for components that need the raw client (e.g. to subscribe
// to every event regardless of type). Most components should prefer
// useNotification below instead.
export function useNotificationClient() {
  const client = useContext(NotificationContext)
  if (!client) {
    throw new Error("useNotificationClient must be used within a <NotificationProvider>")
  }
  return client
}

// Registers `listener` for events matching `type`. Subscribes on mount and
// unsubscribes automatically on cleanup, scoped to whichever component
// calls this hook - no manual bookkeeping required.
export function useNotification<T>(type: TNotificationType, listener: Listener<T>) {
  const client = useNotificationClient()

  onMount(() => {
    const unsubscribe = client.subscribe<T>((event) => {
      if (event.type === type) listener(event)
    })
    onCleanup(unsubscribe)
  })
}
