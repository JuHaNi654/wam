import { createContext, createSignal, JSX, useContext, Show, For, createUniqueId } from "solid-js";
import { Portal } from "solid-js/web";

type ToastType = 'success' | 'error'

type Toast = {
  id: string
  message: string
  type: ToastType
  timeout: number
}

type ToastContext = {
  message: string
}

type Context = {
  success: (ctx: ToastContext) => void
  error: (ctx: ToastContext) => void
}

type Props = {
  count: number
  children: JSX.Element
}


const ToastContext = createContext<Context>()
export function useToast() { return useContext(ToastContext) as Context }

export function ToastProvider(props: Props) {
  const [toasts, setToasts] = createSignal<Array<Toast>>([])

  const newToast = (type: ToastType) => {
    return (ctx: ToastContext) => {
      const id = createUniqueId()

      const newToast: Toast = {
        id,
        message: ctx.message,
        type: type,
        timeout: setTimeout(() => {
          setToasts(prev => prev.filter((t) => t.id !== id))
        }, 5000)
      }

      setToasts(prev => [...prev, newToast])
    }
  }


  const clearToast = (id: string, timeoutID: number) => {
    clearTimeout(timeoutID)
    setToasts(prev => prev.filter((t) => t.id !== id))
  }

  const toast = {
    success: newToast('success'),
    error: newToast('error')
  }

  return (
    <ToastContext.Provider value={toast}>
      {props.children}
      <Show when={toasts().length > 0}>
        <Portal>
          <div class="toast toast-end toast-bottom">
            <For each={toasts()}>
              {(item) => (
                <div onClick={() => clearToast(item.id, item.timeout)} class="alert alert-info cursor-pointer">
                  <p class="font-semibold">{item.message}</p>
                </div>
              )}
            </For>
          </div>
        </Portal>

      </Show>
    </ToastContext.Provider>
  )
}
