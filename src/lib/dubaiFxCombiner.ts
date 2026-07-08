import { DailyDubaiOilPrice } from '../types/fuel'
import { DailyFxRate, DailyDubaiKrwPoint } from '../types/fx'

export function combineDubaiWithFx(dubaiPrices: DailyDubaiOilPrice[], fxRates: DailyFxRate[]): DailyDubaiKrwPoint[] {
  const fxByDate = new Map(fxRates.map(item => [item.date, item]))
  const combined: DailyDubaiKrwPoint[] = []

  // Ensure Dubai data is sorted by date ascending
  const sortedDubai = [...dubaiPrices].sort((a,b)=> a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

  for (const dubai of sortedDubai) {
    const fx = fxByDate.get(dubai.date)
    if (!fx) continue
    combined.push({
      date: dubai.date,
      dubaiUsdPerBarrel: dubai.value,
      usdKrw: fx.usdKrw,
      dubaiKrwPerBarrel: dubai.value * fx.usdKrw,
      fxSource: fx.fxSource,
    })
  }

  return combined
}
