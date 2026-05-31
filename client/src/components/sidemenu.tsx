import { cn } from "@/lib/utils"
import { NavLink } from "react-router"
import { useQuery } from "@tanstack/react-query";
import type { AIAgentStatus } from "@/types/api.types";
import { GET } from "@/lib/api";
import Loading from "./loading";
import { Avatar, AvatarBadge } from "./ui/avatar";
import { RiRobot2Fill } from "@remixicon/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useEffect, useState } from "react";

type Links = {
  label: string;
  path: string
}
const items: Links[] = [
  {
    label: "Home",
    path: "/dashboard"
  },
  {
    label: "New application",
    path: "/job/new"
  },
  {
    label: "Profile",
    path: "/profile"
  }
]

export default function Sidemenu() {
  return (
    <aside className="flex flex-col justify-between col-span-2 border rounded-lg p-4 border-gray-200">
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i}>
            <NavLink to={item.path} className={({ isActive }) => cn(
              "block px-4 rounded-full py-2 text-sm border border-transparent hover:border-gray-300",
              (isActive && "bg-gray-200")
            )}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <AIStatus />
    </aside>
  )
}


const onlineStatus = {
  online: "bg-green-600",
  sleep: "bg-yellow-600",
  offline: "bg-red-600"
}

function AIStatus() {
  const [status, setStatus] = useState(onlineStatus.offline)
  const { data, isLoading } = useQuery({
    queryKey: ["ai-status"],
    queryFn: async () => {
      return await GET<AIAgentStatus>('/api/agent', null)
    },
    retry: 0,
  })

  useEffect(() => {
    if (data) {
      const expiresAt = new Date(data.data.expires_at).getTime()
      const current = new Date().getTime()

      if (expiresAt < current) {
        setStatus(onlineStatus.sleep)
        return
      }
      setStatus(onlineStatus.online)
      return
    }

    setStatus(onlineStatus.offline)
  }, [data])

  return (
    <div>
      <Loading isLoading={isLoading}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar>
              <RiRobot2Fill className="m-auto" />
              <AvatarBadge className={`${status}`} />
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{data ? data.data.name : "Unavailable"}</p>
          </TooltipContent>
        </Tooltip>
      </Loading>
    </div>
  )
}
