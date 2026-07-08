import React from 'react'

export default function KeyMetrics({currentAverage, nextAverage, changeRate, confidence, nowPrice, laterPrice}:{currentAverage:string; nextAverage:string; changeRate:string; confidence:string; nowPrice?:string; laterPrice?:string}){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-4">
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200 col-span-2">
        <div className="text-xs text-slate-500">직전 산정기간 평균</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{currentAverage}</div>
      </div>
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200 col-span-2">
        <div className="text-xs text-slate-500">현재 진행 기간 평균</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{nextAverage}</div>
      </div>
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="text-xs text-slate-500">지금 사는 가격</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{nowPrice ?? '-'}</div>
      </div>
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="text-xs text-slate-500">나중에 사는 가격</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{laterPrice ?? '-'}</div>
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
