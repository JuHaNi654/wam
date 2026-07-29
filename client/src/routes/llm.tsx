import Base from "@/components/base";
import Loading from "@/components/loading";
import { AvatarBadge } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNotification } from "@/context/notification";
import { GET, POST } from "@/lib/api";
import { NotificationLLMStatusChange, type LlamaStatusEvent } from "@/types/notification.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

type Provider = {
  name: string;
  addr: string;
  available: boolean;
}

export default function Providers() {
  const { data, isLoading } = useQuery({
    queryKey: ["llmProviders"],
    queryFn: async () => {
      const { response, error } = await GET<Provider[]>('/api/llm/providers', null)
      if (error) throw error
      return response!.data || []
    }
  })

  return (
    <Base className="flex flex-col gap-4" showMenu>
      <header className="py-4 font-semibold">
        <h1 className="text-4xl">LLM</h1>
      </header>
      <Loading isLoading={isLoading}>
        <div>
          {data && data.map((provider, i) => (
            <details key={i} className="border rounded">
              <summary className="flex justify-between items-center px-4 py-2">
                <div className="flex flex-col">
                  <span className="block text-lg font-semibold">{provider.name}</span>
                  <span className="block text-sm">{provider.addr}</span>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  {provider.available ? 'Available' : 'Unavailable'}
                  <AvatarBadge className={`${provider.available ? 'bg-green-600' : 'bg-red-600'} relative w-3 h-3`} />
                </div>
              </summary>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {provider.available && <Models provider={provider.name} />}
                  </TableBody>
                </Table>
              </div>
            </details>
          ))}
        </div>
      </Loading>
    </Base>
  )
}


type Model = {
  id: string;
  status: string
}

type ModelResponse = {
  models: Model[];
  provider: string;
  in_use: string;
}

type ModelsProps = {
  provider: string
}

function Models(props: ModelsProps) {
  const notification = useNotification()
  const queryClient = useQueryClient()
  const { data, isSuccess, refetch } = useQuery({
    queryKey: ["llmModels"],
    queryFn: async () => {
      const result = await GET<ModelResponse>(`/api/llm/providers/${props.provider}/models`, null)
      if (result.error) throw result.error
      return result.response!.data
    },
  })

  useEffect(() => {
    if (notification.type !== NotificationLLMStatusChange || !data) return
    const content = notification.content as LlamaStatusEvent;

    queryClient.setQueryData<ModelResponse>(['llmModels'], (prev) => {
      if (!prev) return prev

      return {
        ...prev,
        models: prev.models.map((model) => (
          (model.id === content.model) ? { ...model, status: content.data.status } : model
        ))
      }
    })

  }, [notification, queryClient])

  if (!isSuccess || !data) return null

  const loadModel = async (model: string) => {
    const { error } = await POST(`/api/llm/providers/${props.provider}/load`, { model })
    if (error) {
      console.error(error)
      toast.error("Something went wrong while trying to load model", { position: "bottom-right" })
      return
    }
    refetch()
  }

  const unloadModel = async (model: string) => {
    const { error } = await POST(`/api/llm/providers/${props.provider}/unload`, { model })
    if (error) {
      console.error(error)
      toast.error("Something went wrong while trying to unload model", { position: "bottom-right" })
      return
    }

    refetch()
  }

  const enableModel = async (model: string) => {
    const { error } = await POST(`/api/llm/providers/${props.provider}/toggle`, { model })

    if (error && error.status !== 500) {
      toast.error(error.message, { position: "bottom-right" })
      return
    } else if (error) {
      console.error(error)
      toast.error("Something went wrong while trying to unload model", { position: "bottom-right" })
      return
    }

    refetch()
  }

  return (
    <>
      {data.models.map((model) => (
        <TableRow key={model.id}>
          <TableCell>{model.id}</TableCell>
          <TableCell className="w-30 text-right">
            <Button
              onClick={() => {
                if (model.status === "unloaded") {
                  loadModel(model.id)
                } else {
                  unloadModel(model.id)
                }
              }}
              size="xs" variant="secondary">
              {model.status === "loading" && "Loading"}
              {model.status === "unloaded" && "Load"}
              {model.status === "loaded" && "Unload"}
            </Button>
          </TableCell>
          <TableCell className="w-25 text-right">
            <Button onClick={() => enableModel(model.id)}
              size="xs" variant="secondary">
              {data.in_use && data.in_use.includes(model.id) ? "Enabled" : "Disabled"}
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
