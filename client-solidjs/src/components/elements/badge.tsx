import type { ComponentProps, JSX } from "solid-js"
import { twMerge } from "tailwind-merge"

const badgeVariants = {
  saved: "ring-1 ring-white/10 bg-zinc-800",
  applied: "ring-1 ring-blue-400/40 bg-blue-400/20 text-blue-400",
  interviewing: "ring-1 ring-emerald-400 bg-emerald-400/20",
  offered: "ring-1 ring-emerald-500/20 bg-emerald-400 text-zinc-950",
  rejected: "ring-1 ring-rose-500/20 bg-rose-500/10 text-rose-500",
  withdrawn: "ring-1 ring-white/10 bg-zinc-950"
}

type Props = {
  label: string
  variant: keyof typeof badgeVariants
  class?: string
}
export default function Badge(props: Props) {
  return (
    <span class={twMerge(
      props.class,
      badgeVariants[props.variant],
      "px-3 py-1 rounded-md font-semibold capitalize"
    )}>{props.label}</span>
  )
}
