import type { ComponentProps, JSX } from "solid-js"
import { twMerge } from "tailwind-merge"

const buttonVariants = {
  primary: "btn-glow btn-glow-primary ring-1 ring-white/20",
  secondary: "border border-transparent hover:border-white/20 hover:bg-zinc-800 focus:bg-zinc-800 transition-[background, border] duration-200 ease-linear",
  outline: "text-zinc-400 ring-1 ring-white/20 bg-zinc-900 hover:text-white focus:text-white hover:bg-zinc-800 focus:bg-zinc-800 transition-[background, color] duration-200 ease-linear",
  disabled: "bg-zinc-800 text-zinc-500 ring-1 ring-white/20 cursor-not-allowed",
  danger: "btn-glow btn-glow-danger ring-inset ring-rose-500/[0.2] shadow-[inset_0_0_16px_rgba(244,63,94,.28),inset_0_1px_0_rgba(253,164,175,.2)]"
}

const iconSize = {
  lg: "w-10",
  md: "w-8",
  sm: "w-6",
}

type Props = {
  icon?: JSX.Element,
  variant: keyof typeof buttonVariants;
  label: string
} & ComponentProps<"button">
export function Button({ icon, variant, label, class: styles, ...props }: Props) {
  return (
    <button class={twMerge(
      "relative flex items-center justify-center gap-4 cursor-pointer",
      "px-8 py-2 rounded-xl font-semibold",
      buttonVariants[variant], styles
    )} {...props}>
      {icon ? icon : null}
      <span class=" text-sm">{label}</span>
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
      "aspect-square relative flex items-center justify-center gap-4 cursor-pointer",
      "rounded font-semibold ring-1 ring-white/20 grid place-content-center bg-zinc-900 hover:bg-zinc-800",
      iconSize[size],
      styles
    )} {...props}>
      <i class={twMerge(icon, "w-full h-full")}></i>
    </button>
  )
}
