import Papa from 'papaparse'
import { format, parse } from 'date-fns'
import { DailyFxRate } from '../types/fx'

const DATE_COLS = ['observation_date', 'date', 'Date']
const FX_COLS = ['DEXKOUS', 'dexkous', 'USD/KRW', 'USDKRW']

function normalizeNumber(value: string | null | undefined) {
  if (value === null || value === undefined) return NaN
  const cleaned = String(value).replace(/[\s,]/g, '').replace(/[^0-9.\-]/g, '')
  return cleaned === '' ? NaN : Number(cleaned)
}

function parseDate(value: string | null | undefined) {
  if (value === null || value === undefined) return null
  const trimmed = String(value).trim()
  const formats = ['yyyy-MM-dd','yyyy.MM.dd','yyyy/MM/dd','yyyyMMdd','dd-MM-yyyy','dd.MM.yyyy','MM/dd/yyyy']
  for (const fmt of formats) {
    try {
      const d = parse(trimmed, fmt, new Date())
      if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd')
    } catch (_) {
      // continue
    }
  }
  const fallback = new Date(trimmed)
  if (!isNaN(fallback.getTime())) return format(fallback, 'yyyy-MM-dd')
  return null
}

export function parseDexKousCsv(csvText: string): DailyFxRate[] {
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
  const rows = parsed.data as Record<string,string>[]
  const headers = Object.keys(rows[0] || {})

  const dateKey = headers.find(h => DATE_COLS.includes(h)) || headers.find(h => /observation_date|date/i.test(h))
  const fxKey = headers.find(h => FX_COLS.includes(h)) || headers.find(h => /DEXKOUS|usd.?krw|usdkrw/i.test(h))

  if (!dateKey || !fxKey) return []

  const normalized = rows
    .map(row => {
      const date = parseDate(row[dateKey])
      const rate = normalizeNumber(row[fxKey])
      return { date, usdKrw: isNaN(rate) ? null : rate }
    })
    .filter(row => row.date !== null)
    .map(row => ({ date: row.date as string, usdKrw: row.usdKrw }))
    .sort((a,b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

  let lastValidRate: number | null = null
  const filled: DailyFxRate[] = []

  for (const row of normalized) {
    if (row.usdKrw !== null && !isNaN(row.usdKrw)) {
      lastValidRate = row.usdKrw
      filled.push({ date: row.date, usdKrw: row.usdKrw, source: 'DEXKOUS', fxSource: 'same-day' })
      continue
    }

    if (lastValidRate !== null) {
      filled.push({ date: row.date, usdKrw: lastValidRate, source: 'DEXKOUS', fxSource: 'forward-filled' })
      continue
    }

    // drop rows before first valid rate
  }

  return filled
}
