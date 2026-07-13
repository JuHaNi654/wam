import Base from "@/components/base";
import Loading from "@/components/loading";
import { AvatarBadge } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GET, POST, ResponseError } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type Provider = {
  name: string;
  addr: string;
  available: boolean;
}

export default function Providers() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["llmProviders"],
    queryFn: async () => {
      return await GET<{ providers: Provider[] }>('/api/llm/providers', null)
    }
  })

  return (
    <Base className="flex flex-col gap-4" showMenu>
      <header className="py-4 font-semibold">
        <h1 className="text-4xl">LLM</h1>
      </header>
      <Loading isLoading={isLoading}>
        <div>
          {response?.data.providers.map((provider, i) => (
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
                    <Models provider={provider.name} />
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
  models: Model[]
  provider: string
  in_use: {
    model: string;
    provider: string;
  } | null
}

type ModelsProps = {
  provider: string
}

function Models(props: ModelsProps) {
  const { data, refetch } = useQuery({
    queryKey: ["llmModels"],
    queryFn: async () => {
      return await GET<ModelResponse>(`/api/llm/providers/${props.provider}/models`, null)
    }
  })

  const loadModel = async (model: string) => {
    try {
      await POST(`/api/llm/providers/${props.provider}/load`, { model })
      refetch()
    } catch (err: any) {
      console.error(err)
      toast.error("Something went wrong while trying to load model", { position: "bottom-right" })
    }
  }

  const unloadModel = async (model: string) => {
    try {
      await POST(`/api/llm/providers/${props.provider}/unload`, { model })
      refetch()
    } catch (err: any) {
      console.error(err)
      toast.error("Something went wrong while trying to unload model", { position: "bottom-right" })
    }
  }

  const enableModel = async (model: string) => {
    try {
      await POST(`/api/llm/providers/${props.provider}/toggle`, { model })
      refetch()
    } catch (err: any) {
      if (err instanceof ResponseError) {
        toast.error(err!.body![0].message, { position: "bottom-right" })
      } else {
        console.error(err)
        toast.error("Something went wrong while trying to unload model", { position: "bottom-right" })
      }
    }
  }

  return (
    <>
      {data?.data.models && data.data.models.map((model) => (
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
              size="xs" variant={model.status != "unloaded" ? 'destructive' : 'secondary'}>
              {model.status == "unloaded" ? "Load" : "Unload"}
            </Button>
          </TableCell>
          <TableCell className="w-30 text-right">
            <Button onClick={() => enableModel(model.id)}
              size="xs" variant={data.data.in_use && data.data.in_use.model === model.id ? 'destructive' : 'success'}>
              {data.data.in_use && data.data.in_use.model === model.id ? "Disable" : "Enable"}
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
