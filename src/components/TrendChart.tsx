import React from 'react'
import { format } from 'date-fns'
import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis } from 'recharts'
import { DailyDubaiKrwPoint } from '../types/fx'
import { ReferencePeriod } from '../types/fuel'

type PeriodType = 'CURRENT' | 'NEXT'

type ChartPoint = {
  date: string
  timestamp: number
  krwValue: number
  usdValue: number
  usdKrw: number
  fxSource: 'same-day' | 'forward-filled'
  periodType: PeriodType
}

function isInRange(date: string, period: ReferencePeriod) {
  return date >= period.start && date <= period.end
}

function formatDateTick(timestamp: number) {
  return format(new Date(timestamp), 'MM-dd')
}

function formatKrw(value: number) {
  return `${Math.round(value).toLocaleString()}원/bbl`
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null

  const point = payload[0].payload as ChartPoint
  const periodLabel = point.periodType === 'CURRENT' ? '현재 발권월 기준' : '다음 발권월 예측'
  const fxLabel = point.fxSource === 'same-day' ? '당일 환율' : '직전 유효 환율'

  return (
    <div className="min-w-[230px] rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-lg">
      <div className="font-bold text-slate-950">{point.date}</div>
      <div className="mt-3 space-y-1.5 text-slate-600">
        <div>Dubai 가격: <span className="font-semibold text-slate-900">{point.usdValue.toFixed(2)} USD/bbl</span></div>
        <div>적용 환율: <span className="font-semibold text-slate-900">{point.usdKrw.toFixed(2)} 원/USD</span></div>
        <div>환율 적용 방식: <span className="font-semibold text-slate-900">{fxLabel}</span></div>
        <div>원화 환산 Dubai: <span className="font-semibold text-slate-900">{formatKrw(point.krwValue)}</span></div>
        <div>구간: <span className="font-semibold text-slate-900">{periodLabel}</span></div>
      </div>
    </div>
  )
}

function PointShape(props: any) {
  const { cx, cy, fill } = props
  return <circle cx={cx} cy={cy} r={4} fill={fill} fillOpacity={0.9} />
}

export default function TrendChart({
  prices,
  currentPeriod,
  nextPredictionPeriod,
}: {
  prices: DailyDubaiKrwPoint[]
  currentPeriod: ReferencePeriod
  nextPredictionPeriod: ReferencePeriod
}) {
  const points: ChartPoint[] = prices
    .filter(point => isInRange(point.date, currentPeriod) || isInRange(point.date, nextPredictionPeriod))
    .map(point => ({
      date: point.date,
      timestamp: new Date(point.date).getTime(),
      krwValue: point.dubaiKrwPerBarrel,
      usdValue: point.dubaiUsdPerBarrel,
      usdKrw: point.usdKrw,
      fxSource: point.fxSource,
      periodType: isInRange(point.date, currentPeriod) ? 'CURRENT' : 'NEXT',
    }))

  const currentData = points.filter(point => point.periodType === 'CURRENT')
  const nextData = points.filter(point => point.periodType === 'NEXT')

  return (
    <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <h2 className="break-keep text-xl font-bold text-slate-950">원화 환산 두바이유 추세 비교</h2>
        <p className="mt-2 break-keep text-sm leading-6 text-slate-500">
          선택한 발권일 기준으로 계산에 사용된 원화 환산 Dubai 일별 데이터를 점으로 표시합니다.
        </p>
      </div>

      <div className="mt-5 h-[300px] w-full">
        {points.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[20px] bg-slate-50 text-sm text-slate-500">
            선택한 기간에 표시할 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 14, right: 12, bottom: 12, left: 12 }}>
              <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 8" />
              <XAxis
                type="number"
                dataKey="timestamp"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatDateTick}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeDasharray: '4 4' }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 16 }} />
              <Scatter name="현재 발권월 기준" data={currentData} fill="#0EA5E9" shape={<PointShape />} />
              <Scatter name="다음 발권월 예측" data={nextData} fill="#10B981" shape={<PointShape />} />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
