import { createRoute } from "@tanstack/solid-router"
import Layout from "./layouts/base"
import PageHeading from "../components/page-heading"
import { NotificationLLMModelEnabled, NotificationLLMStatusChange, TLlamaStatusEvent, TModelToggleEvent, TProviderModels } from "../models/models"
import { GET, POST } from "../utils/api"
import { For, Index, createResource, Show } from "solid-js"
import { useNotification } from "../utils/notification"
import { setAtPath } from "../utils/set-at-path"
import { Button } from "../components/elements/button"
import Badge from "../components/elements/badge"
import { useToast } from "../components/toast"

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
  return await GET<Response>("/llm/providers?view=extended", null)
}

function LLM() {
  const toast = useToast()
  const [result, { mutate }] = createResource(fetchProviders)

  useNotification<TLlamaStatusEvent>(NotificationLLMStatusChange, (event) => {
    mutate((previous) => {
      if (!previous) return previous

      const providers = previous?.response?.data.items
      const providerIndex = providers?.findIndex((provider) => provider.provider.name === event.content.provider) ?? -1
      const modelIndex = providerIndex < 0
        ? -1
        : providers![providerIndex].models.findIndex((model) => model.id === event.content.model)

      if (providerIndex < 0 || modelIndex < 0) return previous

      return setAtPath(previous, [
        "response",
        "data",
        "items",
        providerIndex,
        "models",
        modelIndex,
        "status",
      ], event.content.data.status)
    })
  })

  useNotification<TModelToggleEvent>(NotificationLLMModelEnabled, (event) => {
    mutate((previous) => {
      if (!previous) return previous
      return setAtPath(previous, ["response", "data", "in_use"], event.content.model)
    })
  })

  const loadModel = async (provider: string, model: string) => {
    const { error } = await POST(`/llm/providers/${provider}/enable`, { model })
    if (error) {
      toast.error({ message: "Unabled load selected model" })
      console.error(error)
    }

  }

  const unloadModel = async (provider: string, model: string) => {
    const { error } = await POST(`/llm/providers/${provider}/disable`, { model })
    if (error) {
      toast.error({ message: "Unabled unload selected model" })
      console.error(error)
    }
  }

  const useModel = async (provider: string, model: string) => {
    const { response, error } = await POST<{ in_use: string }>(`/llm/select`, { provider, model })
    if (error) {
      toast.error({ message: "Unabled toggle selected model" })
      console.error(error)
      return
    }

    mutate((previous) => {
      if (!previous) return previous
      return setAtPath(previous, ["response", "data", "in_use"], response?.data.in_use)
    })
  }

  return (
    <>
      <PageHeading title="Models" />
      <Show when={!result.loading}>
        <Index each={result()!.response?.data.items}>
          {(item) => (
            <details class="ring-1 ring-white/20 rounded-lg overflow-hidden">
              <summary class="flex justify-between items-center px-4 py-4 bg-zinc-800 cursor-pointer">
                <div class="flex flex-col">
                  <span class="block text-lg font-semibold">{item().provider.name}</span>
                  <span class="block text-sm">{item().provider.addr}</span>
                </div>
                <div class="flex flex-row gap-4 items-center">
                  <Badge class="text-sm" variant={item().provider.available ? 'offered' : 'rejected'} label={item().provider.available ? 'Available' : 'Unavailable'} />
                  <span class="block text-xs text-zinc-500">{item().models.length} models</span>
                </div>
              </summary>
              <div class="p-4">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th class="text-center">Action</th>
                      <th class="text-center">On</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={item().models}>
                      {(model) => {
                        return (
                          <tr>
                            <td>{model.id}</td>
                            <td class="capitalize w-20">
                              <div class="flex justify-center">
                                <Button class="w-full" onClick={() => {
                                  if (model.status === "loaded") unloadModel(item().provider.name, model.id)
                                  if (model.status === "unloaded") loadModel(item().provider.name, model.id)
                                }} label={model.status} variant={model.status === "loaded" ? "primary" : "outline"} disabled={model.status === "loading"} />
                              </div>
                            </td>
                            <td class="w-20 text-center">
                              <input onChange={() => useModel(item().provider.name, model.id)} type="checkbox"
                                checked={result()!.response!.data.in_use?.includes(model.id)}
                                disabled={model.status !== "loaded"}
                                class="toggle border-0 ring-1 ring-white/20 bg-zinc-500 checked:bg-emerald-400 text-zinc-800 checked:text-zinc-950" />
                            </td>
                          </tr>
                        )
                      }}
                    </For>
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </Index>
      </Show>
    </>
  )
}

export default llmRoute
