import Papa from 'papaparse'
import { parse, format } from 'date-fns'
import { DailyDubaiOilPrice } from '../types/fuel'

const DATE_KEYS = ['date','Date','기간','일자','DATE']
const DUBAI_KEYS = ['Dubai','dubai','두바이','두바이유','DUBAI']

function normalizeNumber(s: string | number | null | undefined) {
  if (s === null || s === undefined || s === '') return NaN
  const cleaned = String(s).replace(/[,\s]/g, '').replace(/[^0-9.\-]/g, '')
  return cleaned === '' ? NaN : Number(cleaned)
}

function tryParseDate(s: string) {
  const candidates = ["yyyy-MM-dd","yyyy.MM.dd","yyyy/MM/dd","yyyyMMdd","dd-MM-yyyy","dd.MM.yyyy","MM/dd/yyyy"]
  for (const fmt of candidates) {
    try {
      const d = parse(s, fmt, new Date())
      if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd')
    } catch (e) {
      // continue
    }
  }
  // fallback: try ISO
  const d2 = new Date(s)
  if (!isNaN(d2.getTime())) return format(d2, 'yyyy-MM-dd')
  return null
}

export function parseOpinetCsv(text: string) {
  const res = Papa.parse(text, { header: true, skipEmptyLines: true })
  const rows = res.data as Record<string,string>[]
  const meta: any = { detectedDateCol: null, detectedDubaiCol: null, warnings: [] }

  if (rows.length === 0) return { data: [], meta }

  const headers = Object.keys(rows[0])
  // detect date col
  let dateCol = headers.find(h => DATE_KEYS.includes(h)) || headers.find(h => /date|기간|일자/i.test(h))
  let dubaiCol = headers.find(h => DUBAI_KEYS.includes(h)) || headers.find(h => /dubai|두바이/i.test(h))

  meta.detectedDateCol = dateCol
  meta.detectedDubaiCol = dubaiCol

  const data: DailyDubaiOilPrice[] = []

  for (const r of rows) {
    const rawDate = dateCol ? r[dateCol] : Object.values(r)[0]
    const rawVal = dubaiCol ? r[dubaiCol] : Object.values(r)[1]
    const date = tryParseDate(String(rawDate))
    const value = normalizeNumber(String(rawVal))
    if (!date || isNaN(value)) {
      meta.warnings.push(`Skipped row; date:${rawDate} val:${rawVal}`)
      continue
    }
    data.push({ date, value, unit: 'USD/bbl', source: 'OpinetCSV' })
  }

  // sort ascending by date
  data.sort((a,b)=> a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

  meta.firstDate = data[0]?.date
  meta.lastDate = data[data.length-1]?.date
  meta.count = data.length
  meta.columns = headers
  return { data, meta }
}
