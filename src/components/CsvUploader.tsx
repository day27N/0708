import React from 'react'
import { parseOpinetCsv } from '../lib/csvParser'
import { DailyDubaiOilPrice } from '../types/fuel'

export default function CsvUploader({onLoad}:{onLoad:(data:DailyDubaiOilPrice[], meta:any)=>void}){
  const handleFile = (f?: File) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result)
      const parsed = parseOpinetCsv(text)
      onLoad(parsed.data, parsed.meta)
    }
    reader.readAsText(f, 'utf-8')
  }

  return (
    <div className="p-3 bg-slate-50 rounded">
      <label className="block text-sm font-medium">오피넷 Dubai CSV 업로드</label>
      <input type="file" accept=".csv,text/csv" onChange={e=>handleFile(e.target.files?.[0])} className="mt-2" />
    </div>
  )
}
