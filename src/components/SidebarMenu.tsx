import React from 'react'

const items = [
  { label: 'Home', icon: '⌂' },
  { label: 'Route Search', icon: '↗' },
  { label: 'Fuel Surcharge', icon: '₩' },
  { label: 'Exchange Rate', icon: '$' },
  { label: 'Saved Routes', icon: '☆' },
]

export default function SidebarMenu() {
  return (
    <aside className="hidden w-72 shrink-0 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm xl:block">
      <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Yuta Dashboard</div>
      <nav className="mt-8 space-y-3">
        {items.map(item => (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-100 text-base text-slate-700">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
