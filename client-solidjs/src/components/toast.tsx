import { createContext, createSignal, JSX, useContext, Show, For, createUniqueId } from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge"

const toastVariants = {
  success: "ring-emerald-500/35 shadow-[inset_0_0_26px_rgba(52,211,153,.14)]",
  error: "ring-rose-500/35 shadow-[inset_0_0_26px_rgba(244,63,94,.14)]"
}

type ToastType = keyof typeof toastVariants
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
  [Type in ToastType]: (ctx: ToastContext) => void
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
  } satisfies Context

  return (
    <ToastContext.Provider value={toast}>
      {props.children}
      <Show when={toasts().length > 0}>
        <Portal>
          <div class="toast toast-end toast-bottom">
            <For each={toasts()}>
              {(item) => (
                <div onClick={() => clearToast(item.id, item.timeout)}
                  class={twMerge(
                    "text-sm p-4 cursor-pointer bg-zinc-900/85 backdrop-blur-lg rounded-lg ring-2 max-w-[20rem]",
                    toastVariants[item.type]
                  )}>
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
