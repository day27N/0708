import React from 'react'
import { DailyDubaiOilPrice } from '../types/fuel'

export default function TrendChart({prices}:{prices:DailyDubaiOilPrice[]}){
  const values = prices.map(p=>p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const path = values.map((v,i)=>{
    const x = (i/(values.length-1))*100
    const y = 100 - ((v-min)/(max-min||1))*100
    return `${i===0?'M':'L'} ${x},${y}`
  }).join(' ')
  return (
    <div className="mt-4 p-3 border rounded">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-40">
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={0.8} />
      </svg>
    </div>
  )
}
