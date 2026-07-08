import React from 'react'
import { DailyDubaiOilPrice, ReferencePeriod } from '../types/fuel'

export default function TrendChart({prices, currentPeriod, nextPredictionPeriod}:{prices:DailyDubaiOilPrice[]; currentPeriod:ReferencePeriod; nextPredictionPeriod:ReferencePeriod}){
  const values = prices.map(p => p.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const total = prices.length
  const path = prices.map((p, i) => {
    const x = total === 1 ? 0 : (i / (total - 1)) * 100
    const y = 100 - ((p.value - minValue) / (maxValue - minValue || 1)) * 100
    return `${i===0 ? 'M' : 'L'} ${x},${y}`
  }).join(' ')

  const findIndex = (date: string) => prices.findIndex(p => p.date === date)
  const currentStart = findIndex(currentPeriod.start)
  const currentEnd = findIndex(currentPeriod.end)
  const nextStart = findIndex(nextPredictionPeriod.start)
  const nextEnd = findIndex(nextPredictionPeriod.end)

  const rectProps = (startIndex:number, endIndex:number, color:string) => {
    if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) return null
    const x = total === 1 ? 0 : (startIndex / (total - 1)) * 100
    const width = total === 1 ? 100 : ((endIndex - startIndex) / (total - 1)) * 100
    return <rect x={x} y={0} width={width} height={100} fill={color} />
  }

  return (
    <div className="mt-4 rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-slate-500">Dubai 일별 가격</div>
          <div className="mt-1 text-slate-900 font-semibold">Trend Chart</div>
        </div>
      </div>
      <div className="relative h-64">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full rounded-3xl overflow-hidden bg-slate-50">
          {rectProps(currentStart, currentEnd, 'rgba(56, 189, 248, 0.16)')}
          {rectProps(nextStart, nextEnd, 'rgba(249, 115, 22, 0.16)')}
          <path d={path} fill="none" stroke="#111827" strokeWidth={1.6} />
        </svg>
      </div>
      <div className="mt-4 text-xs text-slate-500 grid grid-cols-2 gap-3">
        <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-400" />현재 발권월 기준</div>
        <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-400" />다음 발권월 예측</div>
      </div>
      <div className="mt-3 text-xs text-slate-400">
        <div>설명: 차트는 커밋된 두바이 일별 가격을 표시합니다. 데이터 범위: {prices[0]?.date ?? '-'} — {prices[prices.length-1]?.date ?? '-'}. 현재 발권월 기준(파란 영역)은 전전월 16일~전월 15일이며, 주황 영역은 다음 발권월 예측 기간입니다. 데이터가 부족하면 평균/예측이 계산되지 않습니다.</div>
      </div>
    </div>
  )
}
