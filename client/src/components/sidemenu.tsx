import { cn } from "@/lib/utils"
import { NavLink } from "react-router"
import { useQuery } from "@tanstack/react-query";
import type { AIAgentStatus } from "@/types/api.types";
import { GET } from "@/lib/api";
import Loading from "./loading";
import { Avatar, AvatarBadge } from "./ui/avatar";
import { RiAddBoxLine, RiHome2Line, RiRobot2Fill, RiUserFill } from "@remixicon/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Links = {
  label: string;
  path: string;
  icon: React.ReactElement;
}
const items: Links[] = [
  {
    label: "Home",
    path: "/dashboard",
    icon: <RiHome2Line />
  },
  {
    label: "New application",
    path: "/applications/new",
    icon: <RiAddBoxLine />
  },
  {
    label: "Profile",
    path: "/profile",
    icon: <RiUserFill />
  }
]

export default function Sidemenu() {
  return (
    <aside className="flex flex-col items-stretch justify-between col-span-1 border rounded-lg p-4 border-gray-200">
      <ul className="flex flex-col items-center justify-center gap-2">
        {items.map((item, i) => (
          <li key={i}>
            <NavLink aria-label={item.label} to={item.path} className={({ isActive }) => cn(
              "p-3 aspect-square flex items-center rounded-full text-sm border border-transparent hover:border-gray-300",
              (isActive && "bg-gray-200")
            )}>
              {item.icon}
            </NavLink>
          </li>
        ))}
      </ul>
      <AIStatus />
    </aside>
  )
}

function AIStatus() {
  const { data, isFetching } = useQuery({
    queryKey: ["llm-status"],
    queryFn: async () => {
      return await GET<AIAgentStatus>('/api/llm/status', null)
    },
    refetchInterval: 5000
  })

  return (
    <div className="mx-auto">
      <Loading isLoading={isFetching}>
        <Tooltip>
          <TooltipTrigger asChild>

            <NavLink aria-label="Go ai settings page" to="/models">
              <Avatar>
                <RiRobot2Fill className="m-auto" />
                <AvatarBadge className={data?.data.available ? "bg-green-600" : "bg-red-600"} />
              </Avatar>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{data?.data.available ? data?.data.in_use?.model : "Unavailable"}</p>
          </TooltipContent>
        </Tooltip>
      </Loading>
    </div>
  )
}
