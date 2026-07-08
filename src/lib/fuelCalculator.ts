import { DailyDubaiOilPrice } from '../types/fuel'
import { parseISO, compareAsc } from 'date-fns'

export function calculateAverage(prices: DailyDubaiOilPrice[], startDate: string, endDate: string) {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const slice = prices.filter(p => {
    const d = parseISO(p.date)
    return (compareAsc(d, start) >= 0) && (compareAsc(d, end) <= 0)
  })
  if (slice.length === 0) return { average: null, count: 0 }
  const sum = slice.reduce((s, p) => s + p.value, 0)
  return { average: sum / slice.length, count: slice.length }
}

export function calculateChangeRate(currentAverage: number | null, nextPartialAverage: number | null) {
  if (currentAverage === null || nextPartialAverage === null) return null
  if (currentAverage === 0) return null
  return ((nextPartialAverage - currentAverage) / currentAverage) * 100
}

export function calculateConfidenceProgress(ticketingDate: string, fullNextReferencePeriod: {start:string,end:string}, availableUntil: string) {
  const s = parseISO(fullNextReferencePeriod.start)
  const e = parseISO(fullNextReferencePeriod.end)
  const avail = parseISO(availableUntil)
  const actualEnd = avail < e ? avail : e
  const ticket = parseISO(ticketingDate)
  const progressedTill = actualEnd < ticket ? actualEnd : ticket
  const totalDays = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000*60*60*24)) + 1)
  const progressedDays = Math.max(0, Math.ceil((progressedTill.getTime() - s.getTime()) / (1000*60*60*24)) + 1)
  const progress = Math.max(0, Math.min(100, Math.round((progressedDays/totalDays)*100)))
  const label = progress < 30 ? '낮음' : progress < 70 ? '보통' : '높음'
  return { progress, label }
}
