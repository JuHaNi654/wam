import type { ComponentProps } from "solid-js"

type InputProps = ComponentProps<"input"> & {
  label: string;
  errors?: Array<string>
}

export default function BooleanField(props: InputProps) {
  return (
    <fieldset class="fieldset w-full flex items-end">
      <label class="label flex gap-2 items-center input w-full" for={props.name}>
        <input type="checkbox" class="checkbox" id={props.name} name={props.name} {...props} />
        <span>{props.label}</span>
      </label>
      {props.errors?.length && <em>{props.errors.join(", ")}</em>}
    </fieldset>
  )
}
