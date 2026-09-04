import type { ComponentProps } from "solid-js"

type InputProps = ComponentProps<"input"> & {
  label: string;
  errors?: Array<string>
}

export default function InputField(props: InputProps) {
  return (
    <fieldset class="fieldset w-full">
      <label class="label" for={props.name}>{props.label}</label>
      <input class="input w-full" id={props.name} name={props.name} {...props} />
      {props.errors?.length && <em>{props.errors.join(", ")}</em>}
    </fieldset>
  )
}
