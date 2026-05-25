import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import useFetch from "~/hooks/useFetch";
import Loading from "~/components/loading";
import type { ApplicationListing, ApplicationStatus } from "~/types/api.types";
import { renderDate } from "~/lib/date";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const statusVariant: Record<ApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'> = {
  saved: "default",
  applied: "secondary",
  interviewing: "outline",
  offered: "default",
  rejected: "destructive",
  withdrawn: "outline",
};

type ResponseData = {
  data: {
    applications: ApplicationListing[]
  };
};

export default function Home() {
  const { response, loading, error } = useFetch<ResponseData>("/api/jobs");

  return (
    <Loading isLoading={loading}>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
          <Button asChild>
            <Link to="/job/new">New application</Link>
          </Button>
        </div>
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
            {response && response.data.applications.map((item) => (
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
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/application/${item.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Loading>
  );
}
