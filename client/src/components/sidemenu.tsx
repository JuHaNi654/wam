import { For } from "solid-js"
import { Link, useLocation } from "@tanstack/solid-router"


type Links = {
  label: string;
  path: string;
}
const items: Links[] = [
  {
    label: "Applications",
    path: "/applications",
  },
  {
    label: "New application",
    path: "/applications/new",
  },
  {
    label: "Profile",
    path: "/profile",
  },
  {
    label: "Settings",
    path: "/settings",
  },
  {
    label: "LLM",
    path: "/models",
  }
]

export default function Sidemenu() {
  const location = useLocation()

  return (
    <aside class="m-2 rounded-md bg-zinc-900 ring-1 ring-white/[.07] shadow-[inset_0_1px_0_rgba(255,255,255,.05),0_24px_48px_-24px_rgba(0,0,0,.95)] flex flex-col items-stretch justify-between p-2">
      <ul class="flex flex-col items-stretch gap-2">
        <For each={items}>
          {(item) => (
            <li>
              <Link data-page={location().pathname === item.path} to={item.path} class="block rounded-lg sidenav-btn">
                <span class="text-sm font-semibold">{item.label}</span>
              </Link>
            </li>)}
        </For>
      </ul>
    </aside>
  )
}
