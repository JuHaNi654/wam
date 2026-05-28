import { cn } from "@/lib/utils"
import { NavLink } from "react-router"

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
    <aside className="col-span-2 border rounded-lg p-4 border-gray-200">
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
    </aside>
  )
}
