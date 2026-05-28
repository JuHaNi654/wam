
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loading from "@/components/loading";
import type { ApplicationListing, ApplicationStatus } from "@/types/api.types";
import { renderDate } from "@/lib/date";
import Base from "@/components/base";
import { RiEyeLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/lib/api";

const statusVariant: Record<ApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'> = {
  saved: "default",
  applied: "secondary",
  interviewing: "outline",
  offered: "default",
  rejected: "destructive",
  withdrawn: "outline",
};

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      return await GET<{ applications: ApplicationListing[] }>('/api/jobs', null)
    },
  })

  return (
    <Base className="flex flex-col gap-4" showMenu>
      <header className="py-4 font-semibold">
        <h1 className="text-4xl">Applications</h1>
      </header>
      <Loading isLoading={isLoading}>
        <div className="border border-gray-200 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.data.applications.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.company}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {renderDate(item.create_date)}
                  </TableCell>
                  <TableCell>
                    <Button className="rounded-md" asChild variant="outline" size="sm">
                      <Link to={`/application/${item.id}`}>
                        <RiEyeLine />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Loading>
    </Base>
  )
}
