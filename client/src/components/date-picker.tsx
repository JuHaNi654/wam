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
  disabled?: boolean;
  onDateChange?: (date: Date) => void
}

export function DatePickerInput(props: Props) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>(
    new Date("2025-06-01")
  )
  const [month, setMonth] = useState<Date | undefined>(date)

  return (
    <Field>
      <FieldLabel htmlFor="date-required">{props.label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          disabled={props.disabled}
          id="date-required"
          value={formatDate(date)}
          placeholder="June 01, 2025"
          onChange={(e) => {
            const date = new Date(e.target.value)
            if (props.onDateChange) props.onDateChange(date)
            if (isValidDate(date)) {
              setDate(date)
              setMonth(date)
            }
          }}
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
                onSelect={(date) => {
                  setDate(date as Date)
                  setOpen(false)
                  if (props.onDateChange) props.onDateChange(date as Date)
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

