import { cn } from "@/lib/utils"
import { NavLink } from "react-router"
import { useQuery } from "@tanstack/react-query";
import type { AIAgentStatus } from "@/types/api.types";
import { GET } from "@/lib/api";
import Loading from "./loading";
import { Avatar, AvatarBadge } from "./ui/avatar";
import { RiAddBoxLine, RiHome2Line, RiRobot2Fill, RiUserFill } from "@remixicon/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useEffect, useState } from "react";

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
    if (data && data.data.name.length !== 0) {
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
    <div className="mx-auto">
      <Loading isLoading={isLoading}>
        <Tooltip>
          <TooltipTrigger asChild>

            <NavLink aria-label="Go ai settings page" to="/models">
              <Avatar>
                <RiRobot2Fill className="m-auto" />
                <AvatarBadge className={`${status}`} />
              </Avatar>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{data && data.data.name.length !== 0 ? data.data.name : "Unavailable"}</p>
          </TooltipContent>
        </Tooltip>
      </Loading>
    </div>
  )
}
