import { children, createEffect } from "solid-js";
import type { JSX, ComponentProps } from "solid-js";
import { twMerge } from "tailwind-merge"

type Props = ComponentProps<"select"> & {
  label?: string;
  children: JSX.Element
  class?: string
}
export default function SelectField({ label, class: style, children: c, ...props }: Props) {
  const resolved = children(() => c)
  let selectRef!: HTMLSelectElement

  createEffect(() => {
    if (props.value) {
      selectRef.value = String(props.value)
    }
  })

  return (
    <fieldset class="fieldset">
      {label && <legend class="fieldset-legend text-sm">{label}</legend>}
      <select ref={selectRef} class={twMerge(
        "select w-full",
        style
      )} {...props}>
        {resolved()}
      </select>
    </fieldset>
  )
}
