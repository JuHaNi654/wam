import type { JSX } from "solid-js"

type CalendarDateElement = HTMLElement & {
  value: string
}

type CalendarMonthElement = HTMLElement & {
  offset: number
}

type CalendarSelectYearElement = HTMLElement & {
  slot: string;
  "max-years": string
}

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-date": JSX.HTMLAttributes<CalendarDateElement> & {
        value?: string
        min?: string
        max?: string
      }
      "calendar-month": JSX.HTMLAttributes<CalendarMonthElement> & {
        offset?: number
      }
      "calendar-select-year": JSX.HTMLAttributes<CalendarSelectYearElement> & {
        slot: string
        "max-years": string
      }
    }
  }
}

export { }
