import React from 'react'

type KeyMetricsProps = {
  currentAverage: string
  nextAverage: string
  routeAdjustedCurrent: string
  routeAdjustedNext: string
  changeRate: string
  confidence: string
}

export default function KeyMetrics({currentAverage, nextAverage, routeAdjustedCurrent, routeAdjustedNext, changeRate, confidence}:KeyMetricsProps){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-4">
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200 col-span-2">
        <div className="text-xs text-slate-500">직전 산정기간 평균 (KRW/bbl)</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{currentAverage}</div>
      </div>
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200 col-span-2">
        <div className="text-xs text-slate-500">현재 진행 기간 평균 (KRW/bbl)</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{nextAverage}</div>
      </div>
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="text-xs text-slate-500">거리조정 지수 (현재)</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{routeAdjustedCurrent}</div>
      </div>
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="text-xs text-slate-500">거리조정 지수 (예측)</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{routeAdjustedNext}</div>
      </div>
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="text-xs text-slate-500">변화율</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{changeRate}</div>
      </div>
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="text-xs text-slate-500">신뢰도</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{confidence}</div>
      </div>
    </div>
  )
}
