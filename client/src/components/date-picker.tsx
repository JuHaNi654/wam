import { useState } from "react"
import { Calendar } from "./ui/calendar"
import { Field, FieldLabel } from "./ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import { RiCalendarLine } from "@remixicon/react"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

type Props = {
  label: string
  valueInUnix: number
  disabled?: boolean;
  onChange?: (dateInUnix: number) => void
}

export function DatePickerInput(props: Props) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>(new Date(props.valueInUnix * 1000))
  const [month, setMonth] = useState<Date | undefined>(date)

  const handleChange = (date: Date) => {
    if (!isValidDate(date)) return

    setDate(date)
    setMonth(date)

    if (props.onChange) {
      let dateInUnix = date.getTime() / 1000
      dateInUnix = Number(dateInUnix.toFixed(0))
      props.onChange(dateInUnix)
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor="date-required">{props.label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          disabled={props.disabled}
          id="date-required"
          value={formatDate(date)}
          placeholder="June 01, 2025"
          onChange={(e) => handleChange(new Date(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                id="date-picker"
                variant="ghost"
                size="icon-xs"
                aria-label="Select date"
              >
                <RiCalendarLine />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                disabled={props.disabled}
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => handleChange(date as Date)}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

