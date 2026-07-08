import React from 'react'
import { RouteDistance } from '../types/fuel'

type Props = {
  departure: string
  destination: string
  month: string
  airline: string
  routes: RouteDistance[]
  airlines: string[]
  onChange: (field: string, value: string) => void
  onSubmit: () => void
}

export default function OnboardingForm({
  departure,
  destination,
  month,
  airline,
  routes,
  airlines,
  onChange,
  onSubmit,
}: Props) {
  const destinationOptions = routes.filter(route => route.originCode === 'ICN')

  return (
    <div className="mt-6 w-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.18)]">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          출발지
          <input
            value={departure}
            onChange={event => onChange('departure', event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
            placeholder="인천(ICN)"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          목적지
          <select
            value={destination}
            onChange={event => onChange('destination', event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
          >
            <option value="">목적지 선택</option>
            {destinationOptions.map(route => (
              <option key={route.destinationCode} value={route.destinationCode}>
                {route.destinationName} ({route.destinationCode})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          여행 월
          <input
            type="month"
            value={month}
            onChange={event => onChange('month', event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          항공사
          <select
            value={airline}
            onChange={event => onChange('airline', event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
          >
            <option value="">항공사 선택</option>
            {airlines.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="mt-6 w-full rounded-3xl bg-sky-600 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
      >
        유류할증료 분석하기
      </button>
    </div>
  )
}
