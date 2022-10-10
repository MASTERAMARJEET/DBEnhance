const formatter = (options: Intl.DateTimeFormatOptions, locale = 'en-In') =>
  new Intl.DateTimeFormat(locale, options).format
const formatDateOptions = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
} as const
const formatDayOptions = { day: 'numeric' } as const
const formatLongDateOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
} as const
const formatMonthOptions = { month: 'long' } as const
const formatMonthYearOptions = { month: 'long', year: 'numeric' } as const
const formatShortWeekdayOptions = { weekday: 'short' } as const
const formatWeekdayOptions = { weekday: 'long' } as const
const formatYearOptions = { year: 'numeric' } as const

export const formatDate = formatter(formatDateOptions)
export const formatDay = formatter(formatDayOptions)
export const formatLongDate = formatter(formatLongDateOptions)
export const formatMonth = formatter(formatMonthOptions)
export const formatMonthYear = formatter(formatMonthYearOptions)
export const formatShortWeekday = formatter(formatShortWeekdayOptions)
export const formatWeekday = formatter(formatWeekdayOptions)
export const formatYear = formatter(formatYearOptions)
