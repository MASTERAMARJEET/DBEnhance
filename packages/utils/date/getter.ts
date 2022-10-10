import { CALENDAR_TYPES, WEEKDAYS } from './const'
import type { CDYM, CDYMD, DYM } from './const'
import { formatYear as defaultFormatYear } from './formatter'

function makeGetEdgeOfNeighbor<TGetPeriod, TGetEdgeOfPeriod>(
  getPeriod: (date: TGetPeriod) => number,
  getEdgeOfPeriod: (farg: number) => TGetEdgeOfPeriod,
  defaultOffset: number,
) {
  return function makeGetEdgeOfNeighborInternal(
    date: TGetPeriod,
    offset = defaultOffset,
  ) {
    const previousPeriod = getPeriod(date) + offset
    return getEdgeOfPeriod(previousPeriod)
  }
}

function makeGetEnd<TArg>(getBeginOfNextPeriod: (farg: TArg) => Date) {
  return function makeGetEndInternal(date: TArg) {
    return new Date(getBeginOfNextPeriod(date).getTime() - 1)
  }
}

function makeGetRange<TArg>(functions: ((farg: TArg) => Date)[]) {
  return function makeGetRangeInternal(date: TArg) {
    return functions.map((fn) => fn(date))
  }
}

function makeGetEdgeOfNeighborMonth<TReturn>(
  getEdgeOfPeriod: (farg: Date) => TReturn,
  defaultOffset: number,
) {
  return function makeGetEdgeOfNeighborMonthInternal(
    date: Date,
    offset = defaultOffset,
  ) {
    const year = getYear(date)
    const month = getMonth(date) + offset
    const previousPeriod = new Date()
    previousPeriod.setFullYear(year, month, 1)
    previousPeriod.setHours(0, 0, 0, 0)
    return getEdgeOfPeriod(previousPeriod)
  }
}

function makeGetEdgeOfNeighborDay<TReturn>(
  getEdgeOfPeriod: (farg: Date) => TReturn,
  defaultOffset: number,
) {
  return function makeGetEdgeOfNeighborDayInternal(
    date: Date,
    offset = defaultOffset,
  ) {
    const year = getYear(date)
    const month = getMonth(date)
    const day = getDate(date) + offset
    const previousPeriod = new Date()
    previousPeriod.setFullYear(year, month, day)
    previousPeriod.setHours(0, 0, 0, 0)
    return getEdgeOfPeriod(previousPeriod)
  }
}

function padStart(num: number, val = 2) {
  const numStr = `${num}`

  if (numStr.length >= val) {
    return num
  }

  return `0000${numStr}`.slice(-val)
}

/**
 * Simple getters - getting a property of a given point in time
 */

/**
 * Gets year from date.
 *
 * @param {Date|number|string} date Date to get year from.
 */
export function getYear(date: Date | number | string) {
  if (date instanceof Date) {
    return date.getFullYear()
  }

  if (typeof date === 'number') {
    return date
  }

  const year = parseInt(date, 10)

  if (typeof date === 'string' && !isNaN(year)) {
    return year
  }

  throw new TypeError(`${date} must be of type Date or number or string`)
}

/**
 * Gets month from date.
 *
 * @param {Date} date Date to get month from.
 */
export function getMonth(date: Date) {
  return date.getMonth()
}

/**
 * Gets human-readable month from date.
 *
 * @param {Date} date Date to get human-readable month from.
 */
export function getMonthHuman(date: Date) {
  return date.getMonth() + 1
}

/**
 * Gets human-readable day of the month from date.
 *
 * @param {Date} date Date to get day of the month from.
 */
export function getDate(date: Date) {
  return date.getDate()
}

export function getDayOfWeek(
  date: Date,
  calendarType = CALENDAR_TYPES.ISO_8601,
) {
  const weekday = date.getDay()

  switch (calendarType) {
    case CALENDAR_TYPES.ISO_8601:
      // Shifts days of the week so that Monday is 0, Sunday is 6
      return (weekday + 6) % 7
    case CALENDAR_TYPES.ARABIC:
      return (weekday + 1) % 7
    case CALENDAR_TYPES.HEBREW:
    case CALENDAR_TYPES.US:
      return weekday
    default:
      throw new Error('Unsupported calendar type.')
  }
}
/**
 * Gets week number according to ISO 8601 or US standard.
 * In ISO 8601, Arabic and Hebrew week 1 is the one with January 4.
 * In US calendar week 1 is the one with January 1.
 *
 * @param {Date} date Date.
 * @param {string} calendarType Calendar type. Can be ISO 8601 or US.
 */
export function getWeekNumber(
  date: Date,
  calendarType = CALENDAR_TYPES.ISO_8601,
) {
  const calendarTypeForWeekNumber =
    calendarType === CALENDAR_TYPES.US
      ? CALENDAR_TYPES.US
      : CALENDAR_TYPES.ISO_8601
  const beginOfWeek = getWeekStart(date, calendarType)
  let year = getYear(date) + 1
  let dayInWeekOne
  let beginOfFirstWeek

  // Look for the first week one that does not come after a given date
  do {
    dayInWeekOne = new Date(
      year,
      0,
      calendarTypeForWeekNumber === CALENDAR_TYPES.ISO_8601 ? 4 : 1,
    )
    beginOfFirstWeek = getWeekStart(dayInWeekOne, calendarType)
    year -= 1
  } while (date < beginOfFirstWeek)

  // @ts-expect-error subtraction for date is supported. TS doesn't understand that
  return Math.round((beginOfWeek - beginOfFirstWeek) / (8.64e7 * 7)) + 1
}
/**
 * Returns a boolean determining whether a given date is on Saturday or Sunday.
 *
 * @param {Date} date Date.
 */
export function isWeekend(date: Date, calendarType = CALENDAR_TYPES.ISO_8601) {
  const weekday = date.getDay()
  switch (calendarType) {
    case CALENDAR_TYPES.ARABIC:
    case CALENDAR_TYPES.HEBREW:
      return weekday === WEEKDAYS.FRIDAY || weekday === WEEKDAYS.SATURDAY
    case CALENDAR_TYPES.ISO_8601:
    case CALENDAR_TYPES.US:
      return weekday === WEEKDAYS.SATURDAY || weekday === WEEKDAYS.SUNDAY
    default:
      throw new Error('Unsupported calendar type.')
  }
}

/**
 * Gets hours from date.
 *
 * @param {Date|string} date Date to get hours from.
 */
export function getHours(date: Date | string) {
  if (date instanceof Date) {
    return date.getHours()
  }

  const datePieces = date.split(':')

  if (datePieces.length >= 2) {
    const hoursString = datePieces[0]
    const hours = parseInt(hoursString, 10)

    if (!isNaN(hours)) {
      return hours
    }
  }

  throw new Error(`date string: ${date} is of invalid format`)
}

/**
 * Gets minutes from date.
 *
 * @param {Date|string} date Date to get minutes from.
 */
export function getMinutes(date: Date | string) {
  if (date instanceof Date) {
    return date.getMinutes()
  }

  const datePieces = date.split(':')

  if (datePieces.length >= 2) {
    const minutesString = datePieces[1] || '0'
    const minutes = parseInt(minutesString, 10)

    if (!isNaN(minutes)) {
      return minutes
    }
  }

  throw new Error(`date string: ${date} is of invalid format`)
}

/**
 * Gets seconds from date.
 *
 * @param {Date|string} date Date to get seconds from.
 */
export function getSeconds(date: Date | string) {
  if (date instanceof Date) {
    return date.getSeconds()
  }

  const datePieces = date.split(':')

  if (datePieces.length >= 2) {
    const secondsString = datePieces[2] || '0'
    const seconds = parseInt(secondsString, 10)

    if (!isNaN(seconds)) {
      return seconds
    }
  }

  throw new Error(`date string: ${date} is of invalid format`)
}

/**
 * Returns a number of days in a month of a given date.
 *
 * @param {Date} date Date.
 */
export function getDaysInMonth(date: Date) {
  return getDate(getMonthEnd(date))
}

/**
 * Formatted DateTime
 */

/**
 * Returns local hours and minutes (hh:mm).
 */
export function getHoursMinutes(date: string | Date) {
  const hours = padStart(getHours(date))
  const minutes = padStart(getMinutes(date))

  return `${hours}:${minutes}`
}

/**
 * Returns local hours, minutes and seconds (hh:mm:ss).
 */
export function getHoursMinutesSeconds(date: string | Date) {
  const hours = padStart(getHours(date))
  const minutes = padStart(getMinutes(date))
  const seconds = padStart(getSeconds(date))

  return `${hours}:${minutes}:${seconds}`
}

/**
 * Returns local month in ISO-like format (YYYY-MM).
 */
export function getISOLocalMonth(date: Date) {
  const year = padStart(getYear(date), 4)
  const month = padStart(getMonthHuman(date))

  return `${year}-${month}`
}

/**
 * Returns local date in ISO-like format (YYYY-MM-DD).
 */
export function getISOLocalDate(date: Date) {
  const year = padStart(getYear(date), 4)
  const month = padStart(getMonthHuman(date))
  const day = padStart(getDate(date))

  return `${year}-${month}-${day}`
}

/**
 * Returns local date & time in ISO-like format (YYYY-MM-DDThh:mm:ss).
 */
export function getISOLocalDateTime(date: Date) {
  return `${getISOLocalDate(date)}T${getHoursMinutesSeconds(date)}`
}

/**
 * Start
 */

export function getCenturyStart(date: string | number | Date) {
  const year = getYear(date)
  const centuryStartYear = year + ((-year + 1) % 100)
  const centuryStartDate = new Date()
  centuryStartDate.setFullYear(centuryStartYear, 0, 1)
  centuryStartDate.setHours(0, 0, 0, 0)
  return centuryStartDate
}
export const getPreviousCenturyStart = makeGetEdgeOfNeighbor(
  getYear,
  getCenturyStart,
  -100,
)
export const getNextCenturyStart = makeGetEdgeOfNeighbor(
  getYear,
  getCenturyStart,
  100,
)

export function getDecadeStart(date: string | number | Date) {
  const year = getYear(date)
  const decadeStartYear = year + ((-year + 1) % 10)
  const decadeStartDate = new Date()
  decadeStartDate.setFullYear(decadeStartYear, 0, 1)
  decadeStartDate.setHours(0, 0, 0, 0)
  return decadeStartDate
}
export const getPreviousDecadeStart = makeGetEdgeOfNeighbor(
  getYear,
  getDecadeStart,
  -10,
)
export const getNextDecadeStart = makeGetEdgeOfNeighbor(
  getYear,
  getDecadeStart,
  10,
)

export function getYearStart(date: string | number | Date) {
  const year = getYear(date)
  const yearStartDate = new Date()
  yearStartDate.setFullYear(year, 0, 1)
  yearStartDate.setHours(0, 0, 0, 0)
  return yearStartDate
}
export const getPreviousYearStart = makeGetEdgeOfNeighbor(
  getYear,
  getYearStart,
  -1,
)
export const getNextYearStart = makeGetEdgeOfNeighbor(getYear, getYearStart, 1)

export function getMonthStart(date: Date) {
  const year = getYear(date)
  const month = getMonth(date)
  const monthStartDate = new Date()
  monthStartDate.setFullYear(year, month, 1)
  monthStartDate.setHours(0, 0, 0, 0)
  return monthStartDate
}
export const getPreviousMonthStart = makeGetEdgeOfNeighborMonth(
  getMonthStart,
  -1,
)
export const getNextMonthStart = makeGetEdgeOfNeighborMonth(getMonthStart, 1)

export function getWeekStart(
  date: Date,
  calendarType = CALENDAR_TYPES.ISO_8601,
) {
  const year = getYear(date)
  const monthIndex = getMonth(date)
  const day = date.getDate() - getDayOfWeek(date, calendarType)
  return new Date(year, monthIndex, day)
}

export function getDayStart(date: Date) {
  const year = getYear(date)
  const month = getMonth(date)
  const day = getDate(date)
  const dayStartDate = new Date()
  dayStartDate.setFullYear(year, month, day)
  dayStartDate.setHours(0, 0, 0, 0)
  return dayStartDate
}
export const getPreviousDayStart = makeGetEdgeOfNeighborDay(getDayStart, -1)
export const getNextDayStart = makeGetEdgeOfNeighborDay(getDayStart, 1)

/**
 * End
 */

export const getCenturyEnd = makeGetEnd(getNextCenturyStart)
export const getPreviousCenturyEnd = makeGetEdgeOfNeighbor(
  getYear,
  getCenturyEnd,
  -100,
)
export const getNextCenturyEnd = makeGetEdgeOfNeighbor(
  getYear,
  getCenturyEnd,
  100,
)

export const getDecadeEnd = makeGetEnd(getNextDecadeStart)
export const getPreviousDecadeEnd = makeGetEdgeOfNeighbor(
  getYear,
  getDecadeEnd,
  -10,
)
export const getNextDecadeEnd = makeGetEdgeOfNeighbor(getYear, getDecadeEnd, 10)

export const getYearEnd = makeGetEnd(getNextYearStart)
export const getPreviousYearEnd = makeGetEdgeOfNeighbor(getYear, getYearEnd, -1)
export const getNextYearEnd = makeGetEdgeOfNeighbor(getYear, getYearEnd, 1)

export const getMonthEnd = makeGetEnd(getNextMonthStart)
export const getPreviousMonthEnd = makeGetEdgeOfNeighborMonth(getMonthEnd, -1)
export const getNextMonthEnd = makeGetEdgeOfNeighborMonth(getMonthEnd, 1)

export const getDayEnd = makeGetEnd(getNextDayStart)
export const getPreviousDayEnd = makeGetEdgeOfNeighborDay(getDayEnd, -1)
export const getNextDayEnd = makeGetEdgeOfNeighborDay(getDayEnd, 1)

/**
 * Range
 */
export const getCenturyRange = makeGetRange([getCenturyStart, getCenturyEnd])
export const getDecadeRange = makeGetRange([getDecadeStart, getDecadeEnd])
export const getYearRange = makeGetRange([getYearStart, getYearEnd])
export const getMonthRange = makeGetRange([getMonthStart, getMonthEnd])
export const getDayRange = makeGetRange([getDayStart, getDayEnd])

/**
 * Generalized getters
 */

/**
 * Returns the beginning of a given range.
 *
 * @param {string} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 */
export function getStart(rangeType: CDYMD, date: Date) {
  switch (rangeType) {
    case 'century':
      return getCenturyStart(date)
    case 'decade':
      return getDecadeStart(date)
    case 'year':
      return getYearStart(date)
    case 'month':
      return getMonthStart(date)
    case 'day':
      return getDayStart(date)
    default:
      throw new Error(`Invalid rangeType: ${rangeType}`)
  }
}
export function getPreviousStart(rangeType: CDYMD, date: Date) {
  switch (rangeType) {
    case 'century':
      return getPreviousCenturyStart(date)
    case 'decade':
      return getPreviousDecadeStart(date)
    case 'year':
      return getPreviousYearStart(date)
    case 'month':
      return getPreviousMonthStart(date)
    case 'day':
      return getPreviousDayStart(date)
    default:
      throw new Error(`Invalid rangeType: ${rangeType}`)
  }
}
export function getNextStart(rangeType: CDYM, date: Date) {
  switch (rangeType) {
    case 'century':
      return getNextCenturyStart(date)
    case 'decade':
      return getNextDecadeStart(date)
    case 'year':
      return getNextYearStart(date)
    case 'month':
      return getNextMonthStart(date)
    default:
      throw new Error(`Invalid rangeType: ${rangeType}`)
  }
}
export const getPreviousStart2 = (rangeType: DYM, date: Date) => {
  switch (rangeType) {
    case 'decade':
      return getPreviousDecadeStart(date, -100)
    case 'year':
      return getPreviousYearStart(date, -10)
    case 'month':
      return getPreviousMonthStart(date, -12)
    default:
      throw new Error(`Invalid rangeType: ${rangeType}`)
  }
}
export const getNextStart2 = (rangeType: DYM, date: Date) => {
  switch (rangeType) {
    case 'decade':
      return getNextDecadeStart(date, 100)
    case 'year':
      return getNextYearStart(date, 10)
    case 'month':
      return getNextMonthStart(date, 12)
    default:
      throw new Error(`Invalid rangeType: ${rangeType}`)
  }
}
/**
 * Returns the end of a given range.
 *
 * @param {string} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 */
export function getEnd(rangeType: CDYMD, date: Date) {
  switch (rangeType) {
    case 'century':
      return getCenturyEnd(date)
    case 'decade':
      return getDecadeEnd(date)
    case 'year':
      return getYearEnd(date)
    case 'month':
      return getMonthEnd(date)
    case 'day':
      return getDayEnd(date)
    default:
      throw new Error(`Invalid rangeType: ${rangeType}`)
  }
}
export function getPreviousEnd(rangeType: CDYM, date: Date) {
  switch (rangeType) {
    case 'century':
      return getPreviousCenturyEnd(date)
    case 'decade':
      return getPreviousDecadeEnd(date)
    case 'year':
      return getPreviousYearEnd(date)
    case 'month':
      return getPreviousMonthEnd(date)
    default:
      throw new Error(`Invalid rangeType: ${rangeType}`)
  }
}
export const getPreviousEnd2 = (rangeType: DYM, date: Date) => {
  switch (rangeType) {
    case 'decade':
      return getPreviousDecadeEnd(date, -100)
    case 'year':
      return getPreviousYearEnd(date, -10)
    case 'month':
      return getPreviousMonthEnd(date, -12)
    default:
      throw new Error(`Invalid rangeType: ${rangeType}`)
  }
}
/**
 * Returns an array with the beginning and the end of a given range.
 *
 * @param {string} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 */
export function getRange(rangeType: CDYMD, date: Date) {
  switch (rangeType) {
    case 'century':
      return getCenturyRange(date)
    case 'decade':
      return getDecadeRange(date)
    case 'year':
      return getYearRange(date)
    case 'month':
      return getMonthRange(date)
    case 'day':
      return getDayRange(date)
    default:
      throw new Error(`Invalid rangeType: ${rangeType}`)
  }
}
/**
 * Creates a range out of two values, ensuring they are in order and covering entire period ranges.
 *
 * @param {string} rangeType Range type (e.g. 'day')
 * @param {Date} date1 First date.
 * @param {Date} date2 Second date.
 */
export function getValueRange(rangeType: CDYMD, date1: Date, date2: Date) {
  // @ts-expect-error subtraction for date is supported. TS doesn't understand that
  const rawNextValue = [date1, date2].sort((a, b) => a - b)
  return [
    getStart(rangeType, rawNextValue[0]),
    getEnd(rangeType, rawNextValue[1]),
  ]
}

/**
 * Get Starting year
 */

export function getBeginOfCenturyYear(date: string | number | Date) {
  const beginOfCentury = getCenturyStart(date)
  return getYear(beginOfCentury)
}
export function getBeginOfDecadeYear(date: string | number | Date) {
  const beginOfDecade = getDecadeStart(date)
  return getYear(beginOfDecade)
}
function toYearLabel(formatYear = defaultFormatYear, dates: Date[]) {
  return dates.map((date) => formatYear(date)).join(' – ')
}
/**
 * Returns a string labelling a century of a given date.
 * For example, for 2017 it will return 2001-2100.
 *
 * @param {Date|String|Number} date Date or a year as a string or as a number.
 */
export function getCenturyLabel(
  formatYear: typeof defaultFormatYear,
  date: string | number | Date,
) {
  return toYearLabel(formatYear, getCenturyRange(date))
}
/**
 * Returns a string labelling a century of a given date.
 * For example, for 2017 it will return 2011-2020.
 *
 * @param {Date|String|Number} date Date or a year as a string or as a number.
 */
export function getDecadeLabel(
  formatYear: typeof defaultFormatYear,
  date: string | number | Date,
) {
  return toYearLabel(formatYear, getDecadeRange(date))
}
