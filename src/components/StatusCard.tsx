import React from 'react'

type StatusCardProps = {
  label: string
  value: string
  detail?: string
  tone?: 'primary' | 'neutral' | 'warning'
  active?: boolean
}

const toneStyles = {
  primary: 'border-sky-300 bg-sky-50 text-slate-950',
  neutral: 'border-slate-200 bg-white text-slate-900',
  warning: 'border-amber-200 bg-amber-50 text-slate-950'
}

export default function StatusCard({ label, value, detail, tone = 'neutral', active = false }: StatusCardProps) {
  return (
    <div className={`rounded-[28px] border p-5 shadow-sm transition ${toneStyles[tone]} ${active ? 'ring-2 ring-sky-400' : ''}`}>
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-slate-950">{value}</div>
      {detail ? <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p> : null}
    </div>
  )
}
