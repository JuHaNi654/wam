import type { ComponentProps } from "solid-js"

type Props = {
  label: string
  errors?: Array<string>
} & ComponentProps<"textarea">

export default function TextareaField(props: Props) {
  return (
    <fieldset class="fieldset w-full">
      <label class="label" for={props.name}>{props.label}</label>
      <textarea class="textarea w-full" rows={5} id={props.name} name={props.name} {...props} />
      {props.errors?.length && <em>{props.errors.join(", ")}</em>}
    </fieldset>
  )
}
