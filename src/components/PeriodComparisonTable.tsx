import React from 'react'

type Row = {
  label: string
  value: string
  detail?: string
}

export default function PeriodComparisonTable({ rows }: { rows: Row[] }) {
  return (
    <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold text-slate-950">계산에 사용한 기간</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {rows.map(row => (
          <div key={row.label} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="break-keep text-sm font-semibold text-slate-600">{row.label}</div>
            <div className="text-left sm:text-right">
              <div className="whitespace-nowrap text-base font-bold text-slate-950">{row.value}</div>
              {row.detail ? <div className="mt-1 whitespace-nowrap text-sm text-slate-500">{row.detail}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
