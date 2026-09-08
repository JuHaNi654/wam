import { createRoute } from "@tanstack/solid-router"
import Layout from "./layouts/base"
import PageHeading from "../components/page-heading"
import { NotificationLLMModelEnabled, NotificationLLMStatusChange, TLlamaStatusEvent, TModelToggleEvent, TProviderModels } from "../models/models"
import { GET, POST } from "../utils/api"
import { For, Index, createResource, Suspense } from "solid-js"
import { useNotification } from "../utils/notification"

type Response = {
  items: Array<TProviderModels>,
  in_use: string
}

const llmRoute = createRoute({
  getParentRoute: () => Layout,
  path: 'models',
  component: LLM
})

const fetchProviders = async () => {
  const { response, error } = await GET<Response>("/llm/providers-models", null)
  if (error) throw error
  return response
}

function LLM() {
  const [result, { mutate }] = createResource(true, fetchProviders, {
    initialValue: { status: 0, data: { in_use: "", items: [] } }
  })


  useNotification<TLlamaStatusEvent>(NotificationLLMStatusChange, (event) => {
    // TODO: Rewrite ugly solution
    mutate((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        data: {
          ...prev.data,
          items: prev.data.items.map((provider) => {
            if (provider.provider.name !== event.content.provider) {
              return provider
            }

            return {
              ...provider,
              models: provider.models.map((model) => {
                if (model.id !== event.content.model) {
                  return model
                }

                return {
                  ...model,
                  status: event.content.data.status,
                }
              }),
            }
          }),
        },
      }
    })
  })

  useNotification<TModelToggleEvent>(NotificationLLMModelEnabled, (event) => {
    console.log("ModelEnabled: ", event)
    mutate((prev) => {
      if (!prev) return prev

      return { ...prev, data: { ...prev.data, in_use: event.content.model } }
    })
  })

  const loadModel = async (provider: string, model: string) => {
    const { error } = await POST(`/llm/providers/${provider}/load`, { model })
    if (error) {
      console.error("Unabled load selected model")
      console.error(error)
    }

  }

  const unloadModel = async (provider: string, model: string) => {
    const { error } = await POST(`/llm/providers/${provider}/unload`, { model })
    if (error) {
      console.error("Unabled unload selected model")
      console.error(error)
    }
  }

  const useModel = async (provider: string, model: string) => {
    const { error } = await POST(`/llm/providers/${provider}/toggle`, { model })
    if (error) {
      console.error("Unabled enable selected model")
      console.error(error)
      return
    }
  }

  return (
    <div>
      <PageHeading title="Models" />
      <Suspense fallback={<p>Loading ...</p>}>
        <Index each={result()!.data.items}>
          {(item) => {
            return (
              <details class="border rounded">
                <summary class="flex justify-between items-center px-4 py-2">
                  <div class="flex flex-col">
                    <span class="block text-lg font-semibold">{item().provider.name}</span>
                    <span class="block text-sm">{item().provider.addr}</span>
                  </div>
                  <div class="flex flex-row gap-2 items-center">
                    <span class="text-sm">{item().provider.available ? 'Available' : 'Unavailable'}</span>
                  </div>
                </summary>
                <div class="p-4">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={item().models}>
                        {(model) => {
                          return (
                            <tr>
                              <td>{model.id}</td>
                              <td class="capitalize">
                                <button onClick={() => {
                                  if (model.status === "loaded") unloadModel(item().provider.name, model.id)
                                  if (model.status === "unloaded") loadModel(item().provider.name, model.id)
                                }} disabled={model.status === "loading"} class="btn btn-soft">
                                  {model.status}
                                </button>
                              </td>
                              <td>
                                <input onChange={() => useModel(item().provider.name, model.id)} type="checkbox"
                                  checked={result()!.data.in_use.includes(model.id)} class="toggle toggle-primary" />
                              </td>
                            </tr>
                          )
                        }}
                      </For>
                    </tbody>
                  </table>
                </div>
              </details>
            )
          }}
        </Index>
      </Suspense>
    </div>
  )
}

export default llmRoute
