import { parseOpinetCsv } from '../lib/csvParser'
import { DailyDubaiOilPrice } from '../types/fuel'

// Try to load a public CSV file committed to `public/data/opinet_full.csv` first.
// If not present or parsing fails, fall back to the small internal sample.
const FALLBACK_CSV = `date,Dubai
2026-05-16,95.0
2026-05-17,95.3
2026-05-18,95.6
2026-05-19,95.9
2026-05-20,96.2
2026-05-21,96.5
2026-05-22,96.8
2026-05-23,97.1
2026-05-24,97.4
2026-05-25,97.7
2026-05-26,98.0
2026-05-27,98.3
2026-05-28,98.6
2026-05-29,98.9
2026-05-30,99.2
2026-05-31,99.5
2026-06-01,99.8
2026-06-02,100.1
2026-06-03,100.4
2026-06-04,100.7
2026-06-05,101.0
2026-06-06,101.3
2026-06-07,101.6
2026-06-08,101.9
2026-06-09,102.2
2026-06-10,102.5
2026-06-11,102.8
2026-06-12,103.1
2026-06-13,103.4
2026-06-14,103.7
2026-06-15,104.0
2026-06-16,104.3
2026-06-17,104.6
2026-06-18,104.9
2026-06-19,105.2
2026-06-20,105.5
2026-06-21,105.8
2026-06-22,106.1
2026-06-23,106.4
2026-06-24,106.7
2026-06-25,107.0
2026-06-26,107.3
2026-06-27,107.6
2026-06-28,107.9
2026-06-29,108.2
2026-06-30,108.5
2026-07-01,108.8
2026-07-02,109.1
2026-07-03,109.4
2026-07-04,109.7
2026-07-05,110.0
2026-07-06,110.3
2026-07-07,110.6
2026-07-08,110.9
2026-07-09,111.2
2026-07-10,111.5
2026-07-11,111.8
2026-07-12,112.1
2026-07-13,112.4
2026-07-14,112.7
2026-07-15,113.0
`

export async function loadInternalDubaiCsv(): Promise<DailyDubaiOilPrice[]> {
  // attempt to fetch the committed public CSV
  try {
    const resp = await fetch('/data/opinet_full.csv')
    if (resp.ok) {
      const text = await resp.text()
      const parsed = parseOpinetCsv(text)
      if (parsed.data && parsed.data.length > 0) return parsed.data
    }
  } catch (e) {
    // ignore and fallback
  }

  // fallback to small internal sample
  const parsed = parseOpinetCsv(FALLBACK_CSV)
  return parsed.data
}
