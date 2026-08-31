import { createContext, useContext, useEffect, useState } from 'react'
import Notification from '../lib/sse.ts'
import type { NotificationPayload } from '@/types/notification.types.ts'

type DynamicObject = {
  [key: string]: any
}

const defaultPayload: NotificationPayload<DynamicObject> = {
  type: "",
  content: {},
}

const NotificationContext = createContext<NotificationPayload<DynamicObject>>(defaultPayload)

export function useNotification() {
  return useContext(NotificationContext)
}

type Props = {
  url: string
  children?: React.ReactNode;
}
export default function NotificationProvider(props: Props) {
  const [event, setEvent] = useState<NotificationPayload<DynamicObject>>(defaultPayload)
  useEffect(() => {
    const unsub = Notification.subscribe((e) => {
      setEvent(e as any) //FIXME: fix typing
    })

    if (props.url) Notification.mount(props.url)

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
