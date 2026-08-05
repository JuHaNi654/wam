import Base from "@/components/base";
import Loading from "@/components/loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GET, POST } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { RiDeleteBinLine } from "@remixicon/react";
import { toast } from "sonner"

type ScrapeTarget = {
  url: string;
  class: string
}

type Response = {
  id: string;
  targets: Array<ScrapeTarget>
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const result = await GET<Response>(`/api/settings`, null);
      if (result.error) throw result.error
      return result.response!.data
    }
  })

  if (isLoading) return <Loading isLoading={isLoading} />
  if (!data) return null

  const save = async () => {
    const result = await POST<Response>(`/api/settings`, {
      targets: data.targets
    })


    if (result.error) {
      console.error(result.error)
      toast.error("Something went wrong while trying to create new action", { position: "bottom-right" })
      return
    }

    toast.success("Settings saved", { position: "bottom-right" })
  }

  const onChange = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof ScrapeTarget
    const value = e.target.value

    queryClient.setQueryData<Response>(['settings'], (prev) => {
      if (!prev) return prev

      const targets = prev.targets.map((target, i) => (
        i === idx ? { ...target, [name]: value } : target
      ))

      return { ...prev, targets }
    })
  }

  const newItem = () => {
    queryClient.setQueryData<Response>(['settings'], (prev) => {
      if (!prev) return prev

      return { ...prev, targets: [...prev.targets, { url: "", class: "" }] }
    })
  }

  const deleteItem = (idx: number) => {
    queryClient.setQueryData<Response>(['settings'], (prev) => {
      if (!prev) return prev

      const filtered = prev.targets.filter((_, i) => i !== idx)
      return { ...prev, targets: filtered }
    })
  }

  return (
    <Base className="flex flex-col gap-4" showMenu>
      <header className="py-4 font-semibold">
        <h1 className="text-4xl">Settings</h1>
      </header>
      <section>
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">Job application ad scrape targets</h2>
          <div>
            <Button onClick={() => save()} variant="default">Save</Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Website</TableHead>
              <TableHead>Target css class</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.targets.map((item, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Input type="text" name="url" value={item.url} onChange={(e) => onChange(i, e)} />
                </TableCell>
                <TableCell>
                  <Input type="text" name="class" value={item.class} onChange={(e) => onChange(i, e)} />
                </TableCell>
                <TableCell className="w-6">
                  <Button type="button" variant="destructive"
                    className="shrink-0 cursor-pointer" onClick={() => deleteItem(i)}
                    size="icon-sm" aria-label="Delete">
                    <RiDeleteBinLine />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2}>
                <div className="text-center my-5">
                  <Button onClick={() => newItem()} variant="default">New</Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </Base>
  )
}
