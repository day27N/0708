import React, { useRef, useState } from 'react'
import { DailyDubaiOilPrice, ReferencePeriod } from '../types/fuel'

export default function TrendChart({prices, currentPeriod, nextPredictionPeriod}:{prices:DailyDubaiOilPrice[]; currentPeriod:ReferencePeriod; nextPredictionPeriod:ReferencePeriod}){
  const values = prices.map(p => p.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const total = prices.length

  const findIndex = (date: string) => prices.findIndex(p => p.date === date)
  const currentStart = findIndex(currentPeriod.start)
  const currentEnd = findIndex(currentPeriod.end)
  const nextStart = findIndex(nextPredictionPeriod.start)
  const nextEnd = findIndex(nextPredictionPeriod.end)

  const containerRef = useRef<HTMLDivElement|null>(null)
  const [tooltip, setTooltip] = useState<{visible:boolean,x:number,y:number,content:string}>({visible:false,x:0,y:0,content:''})

  const onPointEnter = (e: React.MouseEvent, p: DailyDubaiOilPrice, segment: string) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const x = rect ? e.clientX - rect.left : 0
    const y = rect ? e.clientY - rect.top : 0
    setTooltip({visible:true,x,y,content:`${p.date} · ${p.value.toFixed(2)} USD/bbl · ${segment}`} )
  }
  const onPointMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip(t => ({...t, x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12}))
  }
  const onPointLeave = () => setTooltip({visible:false,x:0,y:0,content:''})

  const inRange = (i:number, start:number, end:number) => start >=0 && end >=0 && i >= start && i <= end

  // compute averages for optional dashed lines
  const avgFor = (start:number, end:number) => {
    if (start < 0 || end < 0 || end < start) return null
    const slice = prices.slice(start, end+1).map(p=>p.value).filter(v=>!isNaN(v))
    if (slice.length === 0) return null
    return slice.reduce((a,b)=>a+b,0)/slice.length
  }
  const currentAvg = avgFor(currentStart, currentEnd)
  const nextAvg = avgFor(nextStart, nextEnd)

  return (
    <div className="mt-4 rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-slate-500">두바이유 일별 가격</div>
          <div className="mt-1 text-slate-900 font-semibold">두바이유 추세 비교</div>
          <div className="mt-2 text-xs text-slate-500">선택한 발권일 기준으로 계산에 사용된 Dubai 일별 가격 데이터를 점으로 표시합니다. 현재 발권월 산정기간과 다음 발권월 예측기간의 평균을 비교해 발권 타이밍을 판단합니다.</div>
        </div>
      </div>
      <div ref={containerRef} className="relative h-72">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full rounded-3xl overflow-hidden bg-slate-50">
          {/* shaded ranges */}
          {currentStart >=0 && currentEnd >=0 && currentEnd >= currentStart && (()=>{
            const x = total === 1 ? 0 : (currentStart / (total - 1)) * 100
            const width = total === 1 ? 100 : ((currentEnd - currentStart) / (total - 1)) * 100
            return <rect x={x} y={0} width={width} height={100} fill={'rgba(56,189,248,0.08)'} />
          })()}
          {nextStart >=0 && nextEnd >=0 && nextEnd >= nextStart && (()=>{
            const x = total === 1 ? 0 : (nextStart / (total - 1)) * 100
            const width = total === 1 ? 100 : ((nextEnd - nextStart) / (total - 1)) * 100
            return <rect x={x} y={0} width={width} height={100} fill={'rgba(249,115,22,0.08)'} />
          })()}

          {/* average lines (dashed) */}
          {currentAvg !== null && (()=>{
            const y = 100 - ((currentAvg - minValue) / (maxValue - minValue || 1)) * 100
            return <line x1={0} x2={100} y1={y} y2={y} stroke="#38bdf8" strokeDasharray="2 2" strokeWidth={0.5} />
          })()}
          {nextAvg !== null && (()=>{
            const y = 100 - ((nextAvg - minValue) / (maxValue - minValue || 1)) * 100
            return <line x1={0} x2={100} y1={y} y2={y} stroke="#fb923c" strokeDasharray="2 2" strokeWidth={0.5} />
          })()}

          {/* points */}
          {prices.map((p, i) => {
            const x = total === 1 ? 0 : (i / (total - 1)) * 100
            const y = 100 - ((p.value - minValue) / (maxValue - minValue || 1)) * 100
            const inCurrent = inRange(i, currentStart, currentEnd)
            const inNext = inRange(i, nextStart, nextEnd)
            const color = inCurrent ? '#0ea5e9' : inNext ? '#fb923c' : '#111827'
            const r = inCurrent || inNext ? 3.5 : 2.5
            return <circle key={p.date} cx={`${x}`} cy={`${y}`} r={r} fill={color} onMouseEnter={(e)=>onPointEnter(e,p, inCurrent? '현재 발권월 기준' : inNext? '다음 발권월 예측' : '데이터')} onMouseMove={onPointMove} onMouseLeave={onPointLeave} />
          })}
        </svg>
        {tooltip.visible && (
          <div className="absolute z-50 pointer-events-none text-xs bg-slate-900 text-white px-2 py-1 rounded" style={{left: tooltip.x, top: tooltip.y}}>{tooltip.content}</div>
        )}
      </div>
      <div className="mt-4 text-xs text-slate-500 grid grid-cols-2 gap-3">
        <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-400" />현재 발권월 기준</div>
        <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-400" />다음 발권월 예측</div>
      </div>
    </div>
  )
}
