import Base from "@/components/base";
import Loading from "@/components/loading";
import { AvatarBadge } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GET } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type Provider = {
  name: string;
  addr: string;
  available: boolean;
}

export default function Providers() {
  const { data, isLoading } = useQuery({
    queryKey: ["llmProviders"],
    queryFn: async () => {
      return await GET<{ providers: Provider[] }>('/api/ai/providers', null)
    }
  })

  return (
    <Base className="flex flex-col gap-4" showMenu>
      <header className="py-4 font-semibold">
        <h1 className="text-4xl">LLM</h1>
      </header>
      <Loading isLoading={isLoading}>
        <div>
          {data?.data.providers.map((provider, i) => (
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

type ModelsProps = {
  provider: string
}

function Models(props: ModelsProps) {
  const { data, refetch } = useQuery({
    queryKey: ["llmModels"],
    queryFn: async () => {
      return await GET<{ models: Model[] }>(`/api/ai/providers/${props.provider}/models`, null)
    }
  })


  return (
    <>
      {data?.data.models && data.data.models.map((model) => (
        <TableRow key={model.id}>
          <TableCell>{model.id}</TableCell>
          <TableCell className="w-30 text-right">
            <Button size="xs" variant={model.status != "unloaded" ? 'destructive' : 'secondary'}>
              {model.status == "unloaded" ? "Connect" : "Disconnect"}
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
