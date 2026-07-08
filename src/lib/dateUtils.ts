import { parseISO, format, addMonths, subMonths, min } from 'date-fns'

export function toISO(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export function getIssueMonth(ticketingDate: Date): string {
  return format(ticketingDate, 'yyyy-MM')
}

export function getNextIssueMonth(ticketingDate: Date): string {
  return format(addMonths(ticketingDate,1), 'yyyy-MM')
}

export function getCurrentReferencePeriod(issueMonth: string) {
  const [y, m] = issueMonth.split('-').map(Number)
  const issueDate = new Date(y, m - 1, 1)
  const start = new Date(issueDate.getFullYear(), issueDate.getMonth() - 2, 16)
  const end = new Date(issueDate.getFullYear(), issueDate.getMonth() - 1, 15)
  return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') }
}

export function getNextPredictionPeriod(ticketingDate: Date, availableUntil: Date) {
  const prevMonth = subMonths(ticketingDate, 1)
  const start = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 16)
  // full next reference period end (15th of ticketing month)
  const fullNextEnd = new Date(ticketingDate.getFullYear(), ticketingDate.getMonth(), 15)
  let endDate = min([ticketingDate, availableUntil, fullNextEnd])
  // ensure endDate is not before start; if so, clamp to start to avoid inverted ranges
  if (endDate < start) {
    endDate = start
  }
  return { start: format(start, 'yyyy-MM-dd'), end: format(endDate, 'yyyy-MM-dd') }
}

export function getFullNextReferencePeriod(ticketingDate: Date) {
  const prevMonth = subMonths(ticketingDate, 1)
  const start = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 16)
  const end = new Date(ticketingDate.getFullYear(), ticketingDate.getMonth(), 15)
  return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') }
}
