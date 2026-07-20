import { useEffect, useState } from 'react'
import Notification from '../lib/sse.ts'


type Props = {
  url: string
  children?: React.ReactNode;
}

export function useNotification() {
  const [data, setData] = useState({})
  const [eventType, setEventType] = useState("")
  useEffect(() => {

  }, [])

  return { data, eventType }
}

export default function NotificationProvider(props: Props) {
  useEffect(() => {
    console.log("NotificationProvider")
    if (props.url) Notification.mount(props.url)

    return () => {
      Notification.unmount()
    }
  }, [props.url])

  if (props.children) return props.children
  return null
} 
