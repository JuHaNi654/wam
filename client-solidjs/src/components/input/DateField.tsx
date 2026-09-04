import "cally"
import { createUniqueId, onCleanup, onMount } from "solid-js"
import { renderDate } from "../../utils/date"

type InputProps = {
  disabled?: boolean
  label: string
  name: string
  value: number
  errors?: string[]
  onChange?: (value: number) => void
  onBlur?: () => void
}

type CalendarDateElement = HTMLElement & {
  value: string
}

export default function DateField(props: InputProps) {
  let calendar!: CalendarDateElement
  let calendarBtnRef!: HTMLButtonElement

  const popoverId = `cally-popover-${createUniqueId()}`

  const handleChange = (event: any) => {
    let dateInUnix = new Date(event.target.value).getTime() / 1000
    dateInUnix = Number(dateInUnix.toFixed(0))

    calendarBtnRef.innerText = renderDate(dateInUnix)
    props.onChange?.(dateInUnix)
  }

  const handleBlur = () => {
    props.onBlur?.()
  }

  onMount(() => {
    if (!calendar) return

    calendar.addEventListener("change", handleChange)
    calendar.addEventListener("focusout", handleBlur)
  })

  onCleanup(() => {
    if (!calendar) return

    calendar.removeEventListener("change", handleChange)
    calendar.removeEventListener("focusout", handleBlur)
  })

  return (
    <fieldset class="fieldset relative w-full">
      <legend class="fieldset-legend">{props.label}</legend>
      <input type="hidden" name={props.name} value={props.value ?? ""} />
      <button disabled={props.disabled} ref={calendarBtnRef} type="button" style={`anchor-name:--${popoverId}`} popovertarget={popoverId} class="input w-full justify-start text-left">
        {props.value > 0 ? renderDate(props.value) : "Pick a date"}
      </button>
      <div
        popover
        id={popoverId}
        class="border border-base-300 bg-base-100"
        style={`position-anchor:--${popoverId}; transform: translate3d(var(--drag-position-x), var(--drag-position-y), 0); top: anchor(--${popoverId} bottom); left: anchor(left);`}
      >
        <calendar-date class="cally"
          ref={calendar}
          aria-label={props.label}
          value=""
          min="1990-01-01"
          max={new Date().toString()}
        >
          <calendar-select-year max-years="50" slot="heading">
            <span slot="label"></span>
          </calendar-select-year>
          <calendar-month />
        </calendar-date>
      </div>

      {props.errors?.length ? <em>{props.errors.join(", ")}</em> : null}
    </fieldset>
  )
}
