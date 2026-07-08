export type DailyFxRate = {
  date: string; // YYYY-MM-DD
  usdKrw: number;
  source: 'DEXKOUS';
  fxSource: 'same-day' | 'forward-filled';
}

export type DailyDubaiKrwPoint = {
  date: string;
  dubaiUsdPerBarrel: number;
  usdKrw: number;
  dubaiKrwPerBarrel: number;
  fxSource: 'same-day' | 'forward-filled';
}
