import { splitProps, type ComponentProps, type JSX } from "solid-js"
import { twMerge } from "tailwind-merge"
import { Link, type LinkProps } from "@tanstack/solid-router"

const buttonVariants = {
  primary: "btn-glow btn-glow-primary ring-1 ring-white/20",
  secondary: "border border-transparent hover:border-white/20 hover:bg-zinc-800 focus:bg-zinc-800 transition-[background, border] duration-200 ease-linear",
  outline: "text-zinc-400 ring-1 ring-white/20 bg-zinc-900 hover:text-white focus:text-white hover:bg-zinc-800 focus:bg-zinc-800 transition-[background, color] duration-200 ease-linear",
  disabled: "bg-zinc-800 text-zinc-500 ring-1 ring-white/20 cursor-not-allowed",
  danger: "btn-glow btn-glow-danger ring-inset ring-rose-500/[0.2] shadow-[inset_0_0_16px_rgba(244,63,94,.28),inset_0_1px_0_rgba(253,164,175,.2)]"
}

const iconSize = {
  lg: "w-8 h-8",
  md: "w-7 h-7",
  sm: "w-5 h-5",
}

type Props = {
  icon?: JSX.Element,
  variant: keyof typeof buttonVariants;
  label: string,
  loading?: boolean
} & ComponentProps<"button">
export function Button(props: Props) {
  const [local, rest] = splitProps(props, ["icon", "variant", "label", "class"])
  return (
    <button class={twMerge(
      "relative flex items-center justify-center gap-4 cursor-pointer",
      "px-8 py-2 rounded-md font-semibold",
      buttonVariants[local.variant], local.class
    )} {...rest}>
      {local.icon ? local.icon : null}
      {props.loading ? (
        <span class="loading loading-dots loading-sm"></span>
      ) : <span class="text-sm">{local.label}</span>}
    </button>
  )
}

type IconButtonProps = {
  icon: string,
  label: string,
  size: keyof typeof iconSize
} & ComponentProps<"button">

export function IconButton({ icon, size, label, class: styles, ...props }: IconButtonProps) {
  return (
    <button aria-label={label} class={twMerge(
      "relative cursor-pointer h-min p-2",
      "rounded ring-1 ring-white/20  bg-zinc-900 hover:bg-zinc-800",
      styles
    )} {...props}>
      <i class={twMerge(icon, iconSize[size], "aspect-square grid place-content-center")}></i>
    </button>
  )
}

type IconLinkProps = {
  icon: string,
  label: string,
  size: keyof typeof iconSize
  class?: string
} & LinkProps


export function IconLink({ icon, size, label, class: styles, ...props }: IconLinkProps) {
  return (
    <Link aria-label={label} {...props}
      class={twMerge(
        "relative cursor-pointer h-min p-2",
        "rounded ring-1 ring-white/20 bg-zinc-900 hover:bg-zinc-800",
        styles
      )}>
      <i class={twMerge(icon, iconSize[size], "aspect-square grid place-content-center")}></i>
    </Link>
  )
}
