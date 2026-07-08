import React from 'react'

export default function PeriodComparisonTable({rows}:{rows:{label:string,value:string}[]}){
  return (
    <div className="mt-4 border rounded overflow-hidden">
      <table className="w-full">
        <tbody>
          {rows.map(r=> (
            <tr key={r.label} className="border-t"><td className="px-3 py-2 font-medium">{r.label}</td><td className="px-3 py-2 text-right">{r.value}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
