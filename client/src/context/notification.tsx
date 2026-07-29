import { createContext, useContext, useEffect, useState } from 'react'
import Notification from '../lib/sse.ts'
import type { NotificationPayload } from '@/types/notification.types.ts'

const defaultPayload: NotificationPayload<any> = {
  type: "",
  content: {},
}

const NotificationContext = createContext<NotificationPayload<any>>(defaultPayload)

export function useNotification() {
  return useContext(NotificationContext)
}

type Props = {
  url: string
  children?: React.ReactNode;
}
export default function NotificationProvider(props: Props) {
  const [event, setEvent] = useState<NotificationPayload<any>>(defaultPayload)
  useEffect(() => {
    if (props.url) Notification.mount(props.url)
    const unsub = Notification.subscribe((e) => {
      setEvent(e)
    })

    return () => {
      unsub()
      Notification.unmount()
    }
  }, [props.url])

  return (
    <NotificationContext.Provider value={event}>
      {props.children}
    </NotificationContext.Provider>
  )
} 
