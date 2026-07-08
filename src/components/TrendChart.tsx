import React from 'react'
import { DailyDubaiKrwPoint } from '../types/fx'
import { ReferencePeriod } from '../types/fuel'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { format } from 'date-fns'

type ChartPoint = {
  date: string
  timestamp: number
  value: number
  periodType: 'CURRENT' | 'NEXT' | 'OTHER'
}

export default function TrendChart({prices, currentPeriod, nextPredictionPeriod}:{prices:DailyDubaiKrwPoint[]; currentPeriod:ReferencePeriod; nextPredictionPeriod:ReferencePeriod}){
  const chartStart = new Date(currentPeriod.start)
  const chartEnd = new Date(nextPredictionPeriod.end)

  const visible = prices
    .map(p => ({...p, ts: new Date(p.date).getTime()}))
    .filter(p => {
      const t = p.ts
      return t >= chartStart.getTime() && t <= chartEnd.getTime()
    })

  const points: ChartPoint[] = visible.map(p => {
    const t = new Date(p.date).getTime()
    const isCurrent = new Date(p.date) >= new Date(currentPeriod.start) && new Date(p.date) <= new Date(currentPeriod.end)
    const isNext = new Date(p.date) >= new Date(nextPredictionPeriod.start) && new Date(p.date) <= new Date(nextPredictionPeriod.end)
    return { date: p.date, timestamp: t, value: p.dubaiKrwPerBarrel, periodType: isCurrent ? 'CURRENT' : isNext ? 'NEXT' : 'OTHER' }
  })

  const currentData = points.filter(p => p.periodType === 'CURRENT')
  const nextData = points.filter(p => p.periodType === 'NEXT')
  const otherData = points.filter(p => p.periodType === 'OTHER')

  const formatTick = (ts:number) => format(new Date(ts), 'MM-dd')

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null
    const p = payload[0].payload as ChartPoint
    return (
      <div className="bg-white p-2 rounded border text-xs shadow">
        <div className="font-medium">{format(new Date(p.timestamp), 'yyyy-MM-dd')}</div>
        <div>{p.value.toFixed(0)} KRW/bbl</div>
        <div className="text-slate-500">{p.periodType === 'CURRENT' ? '현재 발권월 기준' : p.periodType === 'NEXT' ? '다음 발권월 예측' : ''}</div>
      </div>
    )
  }

  const renderPoint = (props: any) => {
    const { cx, cy, fill, payload } = props
    return (
      <circle cx={cx} cy={cy} r={3} fill={fill} fillOpacity={payload.periodType === 'OTHER' ? 0.45 : 1} />
    )
  }

  return (
    <div className="mt-4 rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-slate-500">원화 환산 Dubai 유가 추세</div>
          <div className="mt-1 text-slate-900 font-semibold">KRW/bbl로 본 일별 유류비 방향성</div>
          <div className="mt-2 text-xs text-slate-500">두바이유 USD 가격과 DEXKOUS 환율을 결합해 원화로 환산한 일별 가격을 표시합니다.</div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="timestamp" domain={[ 'dataMin', 'dataMax' ]} tickFormatter={formatTick} />
            <YAxis dataKey="value" tickFormatter={value => `${Math.round(value).toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter name="기준 외 데이터" data={otherData} fill="#111827" shape={renderPoint} />
            <Scatter name="현재 발권월 기준" data={currentData} fill="#0ea5e9" shape={renderPoint} />
            <Scatter name="다음 발권월 예측" data={nextData} fill="#fb923c" shape={renderPoint} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-xs text-slate-500 grid grid-cols-2 gap-3">
        <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-400" />현재 발권월 기준</div>
        <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-400" />다음 발권월 예측</div>
      </div>
    </div>
  )
}
