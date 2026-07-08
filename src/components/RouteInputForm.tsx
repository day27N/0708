import React from 'react'

type Props = {
  from: string
  to: string
  month: string
  onChange: (v:{from:string,to:string,month:string}) => void
  onAnalyze: () => void
}

export default function RouteInputForm({from,to,month,onChange,onAnalyze}:Props){
  return (
    <div className="p-3 bg-white rounded shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-sm">출발지</label>
          <select className="w-full mt-1 p-2 border rounded" value={from} onChange={e=>onChange({from:e.target.value,to,month})}>
            <option value="ICN">ICN</option>
          </select>
        </div>
        <div>
          <label className="text-sm">도착지</label>
          <select className="w-full mt-1 p-2 border rounded" value={to} onChange={e=>onChange({from,to:e.target.value,month})}>
            <option value="NRT">NRT - 도쿄</option>
            <option value="BKK">BKK - 방콕</option>
            <option value="SIN">SIN - 싱가포르</option>
            <option value="LAX">LAX - 로스앤젤레스</option>
            <option value="CDG">CDG - 파리</option>
          </select>
        </div>
        <div>
          <label className="text-sm">여행 예정월</label>
          <input type="month" className="w-full mt-1 p-2 border rounded" value={month} onChange={e=>onChange({from,to,month:e.target.value})} />
        </div>
        <div className="flex items-end">
          <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={onAnalyze}>분석</button>
        </div>
      </div>
    </div>
  )
}
