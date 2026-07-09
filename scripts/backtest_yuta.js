const fs = require('fs')
const path = require('path')

const ACTUAL_DIRECTION_THRESHOLD_RATE = 3
const YUTA_DIRECTION_THRESHOLD_RATE = 3
const SIGNIFICANT_IMPACT_KRW = 25000
const WEAK_IMPACT_KRW = 20000

const ROUTE_PROFILES = [
  { name: 'short_800mi', distanceMile: 800 },
  { name: 'medium_1900mi', distanceMile: 1900 },
  { name: 'long_3600mi', distanceMile: 3600 },
]

const root = path.resolve(__dirname, '..')
const actualCsvPath = path.join(root, 'data', 'fuel_surcharges_verified_official_only.csv')
const dubaiCsvPath = path.join(root, 'public', 'data', 'dubai_oil.csv')
const fxCsvPath = path.join(root, 'public', 'data', 'DEXKOUS.csv')
const outDir = path.join(root, 'reports')
const detailOutPath = path.join(outDir, 'yuta_backtest_detail.csv')
const actualDetailOutPath = path.join(outDir, 'yuta_backtest_actual_airline_detail.csv')
const summaryOutPath = path.join(outDir, 'yuta_backtest_summary.json')

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  const headers = splitCsvLine(lines[0])
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line)
    return headers.reduce((row, header, index) => {
      row[header] = cols[index] ?? ''
      return row
    }, {})
  })
}

function splitCsvLine(line) {
  const cols = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === ',' && !inQuotes) {
      cols.push(current)
      current = ''
      continue
    }
    current += char
  }

  cols.push(current)
  return cols
}

function parseMoney(value) {
  const cleaned = String(value || '').replace(/[^0-9.\-]/g, '')
  return cleaned === '' ? null : Number(cleaned)
}

function toDate(date) {
  return new Date(`${date}T00:00:00`)
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function average(values) {
  const valid = values.filter(value => typeof value === 'number' && !Number.isNaN(value))
  if (!valid.length) return null
  return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

function changeRate(from, to) {
  if (from === null || to === null || from === 0) return null
  return ((to - from) / from) * 100
}

function monthToNumber(month) {
  const [year, monthValue] = month.split('-').map(Number)
  return year * 12 + monthValue
}

function addOneMonth(month) {
  const [year, monthValue] = month.split('-').map(Number)
  const next = new Date(year, monthValue, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

function ticketingDateForMonth(month) {
  return `${month}-15`
}

function directionFromRate(rate, threshold) {
  if (rate === null) return 'UNKNOWN'
  if (rate >= threshold) return 'UP'
  if (rate <= -threshold) return 'DOWN'
  return 'FLAT'
}

function yutaSignalFromImpact(deltaKrwPerBarrel, estimatedRouteImpactKrw) {
  if (deltaKrwPerBarrel === null || estimatedRouteImpactKrw === null) return 'INSUFFICIENT_DATA'
  if (estimatedRouteImpactKrw >= SIGNIFICANT_IMPACT_KRW && deltaKrwPerBarrel > 0) return 'BUY_NOW'
  if (estimatedRouteImpactKrw >= SIGNIFICANT_IMPACT_KRW && deltaKrwPerBarrel < 0) return 'WAIT'
  if (estimatedRouteImpactKrw >= WEAK_IMPACT_KRW) return 'WEAK_SIGNAL'
  return 'NEUTRAL'
}

function signalDirection(signal, deltaKrwPerBarrel) {
  if (signal === 'BUY_NOW') return 'UP'
  if (signal === 'WAIT') return 'DOWN'
  if (signal === 'WEAK_SIGNAL') return deltaKrwPerBarrel > 0 ? 'UP' : deltaKrwPerBarrel < 0 ? 'DOWN' : 'FLAT'
  if (signal === 'NEUTRAL') return 'FLAT'
  return 'UNKNOWN'
}

function getCurrentReferencePeriod(issueMonth) {
  const [year, month] = issueMonth.split('-').map(Number)
  const issueDate = new Date(year, month - 1, 1)
  const start = new Date(issueDate.getFullYear(), issueDate.getMonth() - 2, 16)
  const end = new Date(issueDate.getFullYear(), issueDate.getMonth() - 1, 15)
  return { start: formatDate(start), end: formatDate(end) }
}

function getFullNextReferencePeriod(ticketingDate) {
  const ticket = toDate(ticketingDate)
  const start = new Date(ticket.getFullYear(), ticket.getMonth() - 1, 16)
  const end = new Date(ticket.getFullYear(), ticket.getMonth(), 15)
  return { start: formatDate(start), end: formatDate(end) }
}

function loadDubaiKrwPoints() {
  const dubaiRows = parseCsv(fs.readFileSync(dubaiCsvPath, 'utf8'))
  const fxRows = parseCsv(fs.readFileSync(fxCsvPath, 'utf8'))
  const fxByDate = new Map()
  let lastFx = null

  for (const row of fxRows.sort((a, b) => a.observation_date.localeCompare(b.observation_date))) {
    const fx = parseMoney(row.DEXKOUS)
    if (fx !== null) lastFx = fx
    if (lastFx !== null) fxByDate.set(row.observation_date, lastFx)
  }

  let carryFx = null
  return dubaiRows
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(row => {
      if (fxByDate.has(row.date)) carryFx = fxByDate.get(row.date)
      const dubaiUsdPerBarrel = parseMoney(row.Dubai)
      if (dubaiUsdPerBarrel === null || carryFx === null) return null
      return {
        date: row.date,
        dubaiUsdPerBarrel,
        usdKrw: carryFx,
        dubaiKrwPerBarrel: dubaiUsdPerBarrel * carryFx,
      }
    })
    .filter(Boolean)
}

function averageKrwForPeriod(points, period, availableUntil) {
  const slice = points.filter(point => (
    point.date >= period.start &&
    point.date <= period.end &&
    point.date <= availableUntil
  ))
  return {
    averageKrw: average(slice.map(point => point.dubaiKrwPerBarrel)),
    dataCount: slice.length,
  }
}

function normalizeActualRows(actualRows) {
  if (actualRows[0] && 'ticketing_month' in actualRows[0]) {
    return actualRows.map(row => {
      const minSurcharge = parseMoney(row.min_surcharge_krw)
      const maxSurcharge = parseMoney(row.max_surcharge_krw)
      const representativeSurchargeKrw = minSurcharge !== null && maxSurcharge !== null
        ? (minSurcharge + maxSurcharge) / 2
        : null

      return {
        airline: row.airline_en || row.airline_ko,
        airline_code: row.airline_en || row.airline_ko,
        ticketing_month: row.ticketing_month,
        representative_surcharge_krw: representativeSurchargeKrw,
        min_surcharge_krw: minSurcharge,
        max_surcharge_krw: maxSurcharge,
        verification_status: row.verification_status,
        source_url: row.source_url,
      }
    })
  }

  return actualRows.flatMap(row => Object.keys(row)
    .filter(key => /^\d{4}-\d{2}$/.test(key))
    .map(month => ({
      airline: row.airline,
      airline_code: row.airline_code,
      ticketing_month: month,
      representative_surcharge_krw: parseMoney(row[month]),
      min_surcharge_krw: null,
      max_surcharge_krw: null,
      verification_status: 'legacy_wide_csv',
      source_url: '',
    })))
}

function buildTransitions(normalizedRows) {
  const availableMonths = Array.from(new Set(normalizedRows
    .map(row => row.ticketing_month)
    .filter(Boolean)))
    .sort((a, b) => monthToNumber(a) - monthToNumber(b))

  return availableMonths
    .map(from => ({ from, to: addOneMonth(from), ticketingDate: ticketingDateForMonth(from) }))
    .filter(transition => availableMonths.includes(transition.to))
}

function buildActualRows(actualRows) {
  const normalizedRows = normalizeActualRows(actualRows)
  const transitions = buildTransitions(normalizedRows)
  const byAirlineMonth = new Map()
  const detailRows = []

  for (const row of normalizedRows) {
    byAirlineMonth.set(`${row.airline}__${row.ticketing_month}`, row)
  }

  for (const transition of transitions) {
    const airlines = Array.from(new Set(normalizedRows.map(row => row.airline))).sort()
    for (const airline of airlines) {
      const fromRow = byAirlineMonth.get(`${airline}__${transition.from}`)
      const toRow = byAirlineMonth.get(`${airline}__${transition.to}`)
      if (!fromRow || !toRow) continue

      const fromValue = fromRow.representative_surcharge_krw
      const toValue = toRow.representative_surcharge_krw
      const rate = changeRate(fromValue, toValue)
      detailRows.push({
        airline,
        airline_code: fromRow.airline_code,
        basis: fromRow.min_surcharge_krw !== null && fromRow.max_surcharge_krw !== null ? 'midpoint_of_min_max' : 'single_value',
        from_month: transition.from,
        to_month: transition.to,
        from_surcharge_krw: fromValue,
        to_surcharge_krw: toValue,
        from_min_surcharge_krw: fromRow.min_surcharge_krw,
        from_max_surcharge_krw: fromRow.max_surcharge_krw,
        to_min_surcharge_krw: toRow.min_surcharge_krw,
        to_max_surcharge_krw: toRow.max_surcharge_krw,
        actual_change_rate: rate,
        actual_direction: directionFromRate(rate, ACTUAL_DIRECTION_THRESHOLD_RATE),
      })
    }
  }

  return { detailRows, transitions }
}

function summarizeActualDirection(detailRows, transition) {
  const rows = detailRows.filter(row => row.from_month === transition.from && row.to_month === transition.to)
  const avgFrom = average(rows.map(row => row.from_surcharge_krw))
  const avgTo = average(rows.map(row => row.to_surcharge_krw))
  const rate = changeRate(avgFrom, avgTo)
  const counts = rows.reduce((acc, row) => {
    acc[row.actual_direction] = (acc[row.actual_direction] || 0) + 1
    return acc
  }, {})

  return {
    avgFrom,
    avgTo,
    actualChangeRate: rate,
    actualDirection: directionFromRate(rate, ACTUAL_DIRECTION_THRESHOLD_RATE),
    rowDirectionCounts: counts,
    rowCount: rows.length,
  }
}

function buildBacktest() {
  const actualRows = parseCsv(fs.readFileSync(actualCsvPath, 'utf8'))
  const { detailRows: actualDetailRows, transitions } = buildActualRows(actualRows)
  const dubaiKrwPoints = loadDubaiKrwPoints()
  const details = []

  for (const transition of transitions) {
    const actual = summarizeActualDirection(actualDetailRows, transition)
    const currentPeriod = getCurrentReferencePeriod(transition.from)
    const nextPeriod = getFullNextReferencePeriod(transition.ticketingDate)
    const current = averageKrwForPeriod(dubaiKrwPoints, currentPeriod, transition.ticketingDate)
    const next = averageKrwForPeriod(dubaiKrwPoints, nextPeriod, transition.ticketingDate)
    const yutaRate = changeRate(current.averageKrw, next.averageKrw)
    const deltaKrwPerBarrel = current.averageKrw !== null && next.averageKrw !== null
      ? next.averageKrw - current.averageKrw
      : null
    const yutaDirection = directionFromRate(yutaRate, YUTA_DIRECTION_THRESHOLD_RATE)

    for (const route of ROUTE_PROFILES) {
      const estimatedRouteImpactKrw = deltaKrwPerBarrel === null
        ? null
        : Math.abs(deltaKrwPerBarrel) * (route.distanceMile / 1000)
      const yutaSignal = yutaSignalFromImpact(deltaKrwPerBarrel, estimatedRouteImpactKrw)
      const appDirection = signalDirection(yutaSignal, deltaKrwPerBarrel)

      details.push({
        from_month: transition.from,
        to_month: transition.to,
        ticketing_date: transition.ticketingDate,
        route_profile: route.name,
        current_period: `${currentPeriod.start}~${currentPeriod.end}`,
        next_period: `${nextPeriod.start}~${nextPeriod.end}`,
        current_avg_krw_per_bbl: current.averageKrw,
        next_avg_krw_per_bbl: next.averageKrw,
        yuta_change_rate: yutaRate,
        yuta_direction: yutaDirection,
        yuta_app_signal: yutaSignal,
        yuta_app_direction: appDirection,
        estimated_route_impact_krw: estimatedRouteImpactKrw,
        actual_avg_from: actual.avgFrom,
        actual_avg_to: actual.avgTo,
        actual_change_rate: actual.actualChangeRate,
        actual_direction: actual.actualDirection,
        direction_matched: yutaDirection === actual.actualDirection,
        app_signal_matched: appDirection === actual.actualDirection,
        actual_row_count: actual.rowCount,
        actual_row_direction_counts: JSON.stringify(actual.rowDirectionCounts),
      })
    }
  }

  return {
    metadata: {
      source: path.relative(root, actualCsvPath),
      note: 'Internal mini backtest only. Official monthly surcharge rows use midpoint of min/max surcharge as each airline monthly representative value.',
      actualDirectionThresholdRate: ACTUAL_DIRECTION_THRESHOLD_RATE,
      yutaDirectionThresholdRate: YUTA_DIRECTION_THRESHOLD_RATE,
      significantImpactKrw: SIGNIFICANT_IMPACT_KRW,
      weakImpactKrw: WEAK_IMPACT_KRW,
      generatedAt: new Date().toISOString(),
    },
    details,
    actualDetailRows,
  }
}

function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const text = typeof value === 'number' ? String(Number(value.toFixed(4))) : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function writeCsv(filePath, rows) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(header => csvEscape(row[header])).join(',')),
  ]
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const result = buildBacktest()
  writeCsv(detailOutPath, result.details)
  writeCsv(actualDetailOutPath, result.actualDetailRows)

  const transitionRows = result.details.filter(row => row.route_profile === ROUTE_PROFILES[0].name)
  const directionMatches = transitionRows.filter(row => row.direction_matched).length
  const appMatchesByRoute = ROUTE_PROFILES.map(route => {
    const rows = result.details.filter(row => row.route_profile === route.name)
    return {
      routeProfile: route.name,
      matched: rows.filter(row => row.app_signal_matched).length,
      total: rows.length,
      accuracy: rows.length ? rows.filter(row => row.app_signal_matched).length / rows.length : null,
    }
  })

  const summary = {
    ...result.metadata,
    transitionChecks: transitionRows.length,
    yutaDirectionMatched: directionMatches,
    yutaDirectionAccuracy: transitionRows.length ? directionMatches / transitionRows.length : null,
    appMatchesByRoute,
    transitions: transitionRows.map(row => ({
      fromMonth: row.from_month,
      toMonth: row.to_month,
      yutaDirection: row.yuta_direction,
      actualDirection: row.actual_direction,
      matched: row.direction_matched,
      actualChangeRate: Number(row.actual_change_rate.toFixed(2)),
      yutaChangeRate: Number(row.yuta_change_rate.toFixed(2)),
      actualRowDirectionCounts: JSON.parse(row.actual_row_direction_counts),
    })),
  }

  fs.writeFileSync(summaryOutPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(summary, null, 2))
  console.log(`\nwrote ${path.relative(root, detailOutPath)}`)
  console.log(`wrote ${path.relative(root, actualDetailOutPath)}`)
  console.log(`wrote ${path.relative(root, summaryOutPath)}`)
}

main()
