import { parseDexKousCsv } from '../lib/fxParser'
import { DailyFxRate } from '../types/fx'

export async function loadFxRates(): Promise<DailyFxRate[]> {
  const resp = await fetch('/data/DEXKOUS.csv')
  if (!resp.ok) {
    throw new Error('DEXKOUS.csv를 불러올 수 없습니다.')
  }
  const text = await resp.text()
  return parseDexKousCsv(text)
}
