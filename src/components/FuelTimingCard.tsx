import React from 'react'
import { Recommendation } from '../types/fuel'

const colors: Record<Recommendation,string> = {
  BUY_NOW: 'bg-green-50 border border-green-200',
  WAIT: 'bg-red-50 border border-red-200',
  NEUTRAL: 'bg-yellow-50 border border-yellow-200',
  INSUFFICIENT_DATA: 'bg-slate-50 border border-slate-200',
}

export default function FuelTimingCard({rec, title, desc, changeRate, confidence}:{rec:Recommendation,title:string,desc:string,changeRate?:number|null,confidence?:any}){
  return (
    <div className={`p-5 rounded ${colors[rec]}`}>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm">{desc}</p>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs">변화율</div>
          <div className="font-medium">{changeRate===null?'-':changeRate?.toFixed(2) + '%'}</div>
        </div>
        <div>
          <div className="text-xs">신뢰도</div>
          <div className="font-medium">{confidence? `${confidence.progress}% (${confidence.label})` : '-'}</div>
        </div>
        <div>
          <div className="text-xs">권고</div>
          <div className="font-medium">{rec}</div>
        </div>
      </div>
    </div>
  )
}
