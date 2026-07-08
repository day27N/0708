import React from 'react'
import { RouteDistance } from '../types/fuel'

type Props = {
  countries: string[]
  routes: RouteDistance[]
  selectedCountry: string
  selectedRoute: RouteDistance | null
  onCountryChange: (country: string) => void
  onRouteChange: (destinationCode: string) => void
}

export default function RouteInputForm({countries, routes, selectedCountry, selectedRoute, onCountryChange, onRouteChange}:Props){
  const currentRoutes = routes.filter(route => route.country === selectedCountry)

  return (
    <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
      <div className="text-xl font-semibold text-slate-950">어디로 가세요?</div>
      <p className="mt-2 text-sm text-slate-500">국가와 도시를 선택하면 운항거리 구간을 함께 보여드려요.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">국가 선택</label>
          <select className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-base" value={selectedCountry} onChange={e => onCountryChange(e.target.value)}>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">도시/공항 선택</label>
          <select className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-base" value={selectedRoute?.destinationCode ?? ''} onChange={e => onRouteChange(e.target.value)}>
            {currentRoutes.map(route => (
              <option key={route.destinationCode} value={route.destinationCode}>{route.destinationName} {route.destinationCode}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedRoute ? (
        <div className="mt-6 rounded-3xl bg-slate-50 border border-slate-200 p-5">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">선택 노선</div>
          <div className="mt-3 text-base font-semibold text-slate-900">{selectedRoute.originName} {selectedRoute.originCode} → {selectedRoute.destinationName} {selectedRoute.destinationCode}</div>
          <div className="mt-3 text-sm text-slate-700">운항거리: {selectedRoute.distanceMile.toLocaleString()} mile / {selectedRoute.distanceKm.toLocaleString()} km</div>
          <div className="mt-2 text-sm text-slate-700">거리구간: {selectedRoute.distanceBandLabel}</div>
          <div className="mt-3 text-xs text-slate-500">거리구간은 실제 항공사별 유류할증료 금액 계산이 아니라, 운항거리 기반 참고 정보입니다.</div>
        </div>
      ) : null}
    </div>
  )
}
