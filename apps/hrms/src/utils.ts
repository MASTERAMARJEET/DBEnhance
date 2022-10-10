import { WorkItem } from '@prisma/client'
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: 'numeric',
})
export function formatedDateTime(date: Date | string) {
  return dateTimeFormatter.format(new Date(date))
}
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})
export function formattedPrice(price: number) {
  return currencyFormatter.format(price)
}
export function totalPrice(items: WorkItem[]) {
  return items
    .map((item) => Number(item.price))
    .reduce((prev, curr) => prev + curr, 0)
}
