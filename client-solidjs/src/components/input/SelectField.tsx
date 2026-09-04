import { children } from "solid-js";
import type { JSX, ComponentProps } from "solid-js";

type Props = ComponentProps<"select"> & {
  label: string;
  children: JSX.Element
}
export default function SelectField({ label, children: c, ...props }: Props) {
  const resolved = children(() => c)
  return (
    <fieldset class="fieldset">
      <legend class="fieldset-legend">{label}</legend>
      <select class="select w-full" {...props}>
        {resolved()}
      </select>
    </fieldset>
  )
}
