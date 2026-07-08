"use client"

import React, { useEffect, useState } from 'react'
import DataSourceNotice from '../components/DataSourceNotice'
import KeyMetrics from '../components/KeyMetrics'
import PeriodComparisonTable from '../components/PeriodComparisonTable'
import TrendChart from '../components/TrendChart'
import { loadInternalDubaiCsv } from '../data/internalDubaiCsv'
import { defaultRoute, routeCountries, routes } from '../data/routes'
import { loadFxRates } from '../data/fxRates'
import { getCurrentReferencePeriod, getFullNextReferencePeriod, getIssueMonth, getNextPredictionPeriod } from '../lib/dateUtils'
import { analyzeKrwFuelData } from '../lib/dailyAnalysis'
import { combineDubaiWithFx } from '../lib/dubaiFxCombiner'
import { AnalysisResult, DailyDubaiOilPrice, RouteDistance } from '../types/fuel'
import { DailyDubaiKrwPoint, DailyFxRate } from '../types/fx'

const statusLabel = {
  BUY_NOW: '지금 발권 유리',
  WAIT: '기다리기 고려',
  NEUTRAL: '큰 차이 없음',
  INSUFFICIENT_DATA: '데이터 부족',
} as const

const statusStyle = {
  BUY_NOW: 'border-sky-100 bg-sky-50 text-sky-800',
  WAIT: 'border-emerald-100 bg-emerald-50 text-emerald-800',
  NEUTRAL: 'border-slate-100 bg-slate-50 text-slate-700',
  INSUFFICIENT_DATA: 'border-amber-100 bg-amber-50 text-amber-800',
} as const

function formatKrw(value: number | null) {
  return value === null ? '-' : Math.round(value).toLocaleString()
}

function formatUsd(value: number | null) {
  return value === null ? '-' : value.toFixed(2)
}

function formatPercent(value: number | null) {
  return value === null ? '-' : `${value.toFixed(2)}%`
}

function formatRouteIndex(value: number | null) {
  return value === null ? '-' : Math.round(value).toLocaleString()
}

export default function Page() {
  const todayStr = new Date().toISOString().slice(0, 10)
  const [prices, setPrices] = useState<DailyDubaiOilPrice[]>([])
  const [fxRates, setFxRates] = useState<DailyFxRate[]>([])
  const [combinedPrices, setCombinedPrices] = useState<DailyDubaiKrwPoint[]>([])
  const [selectedTicketingDate, setSelectedTicketingDate] = useState(todayStr)
  const [selectedCountry, setSelectedCountry] = useState(defaultRoute.country)
  const [selectedRoute, setSelectedRoute] = useState<RouteDistance | null>(defaultRoute)
  const [selectedDestination, setSelectedDestination] = useState(defaultRoute.destinationCode)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentRoutes = routes.filter(route => route.country === selectedCountry)

  const runAnalysis = (
    date: string,
    route: RouteDistance | null,
    sourcePrices = prices,
    sourceFxRates = fxRates,
    sourceCombinedPrices = combinedPrices,
  ) => {
    if (sourcePrices.length === 0 || sourceFxRates.length === 0 || sourceCombinedPrices.length === 0) return null

    const ticketDate = new Date(date)
    const latestDubaiDate = sourcePrices[sourcePrices.length - 1].date
    const issueMonth = getIssueMonth(ticketDate)
    const currentPeriod = getCurrentReferencePeriod(issueMonth)
    const nextPredictionPeriod = getNextPredictionPeriod(ticketDate, new Date(latestDubaiDate))
    const fullNextReferencePeriod = getFullNextReferencePeriod(ticketDate)

    return analyzeKrwFuelData(
      date,
      sourceCombinedPrices,
      sourceFxRates[sourceFxRates.length - 1]?.date ?? date,
      route,
      currentPeriod,
      nextPredictionPeriod,
      fullNextReferencePeriod,
      latestDubaiDate,
    )
  }

  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true)
        const loadedPrices = await loadInternalDubaiCsv()
        const loadedFx = await loadFxRates()
        const combined = combineDubaiWithFx(loadedPrices, loadedFx)

        setPrices(loadedPrices)
        setFxRates(loadedFx)
        setCombinedPrices(combined)
        setAnalysisResult(runAnalysis(todayStr, defaultRoute, loadedPrices, loadedFx, combined))
      } catch {
        setError('데이터를 불러오지 못했습니다. 다시 시도해주세요.')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const handleCountryChange = (country: string) => {
    const nextRoute = routes.find(route => route.country === country) ?? defaultRoute
    setSelectedCountry(country)
    setSelectedRoute(nextRoute)
    setSelectedDestination(nextRoute.destinationCode)
    const result = runAnalysis(selectedTicketingDate, nextRoute)
    if (result) setAnalysisResult(result)
  }

  const handleRouteChange = (destinationCode: string) => {
    const nextRoute = routes.find(route => route.destinationCode === destinationCode)
    if (!nextRoute) return

    setSelectedDestination(destinationCode)
    setSelectedRoute(nextRoute)
    setSelectedCountry(nextRoute.country)
    const result = runAnalysis(selectedTicketingDate, nextRoute)
    if (result) setAnalysisResult(result)
  }

  const handleTicketingDateChange = (date: string) => {
    setSelectedTicketingDate(date)
    const result = runAnalysis(date, selectedRoute)
    if (result) setAnalysisResult(result)
  }

  const handleAnalyzeClick = () => {
    const result = runAnalysis(selectedTicketingDate, selectedRoute)
    if (result) {
      setError(null)
      setAnalysisResult(result)
    } else {
      setError('선택한 조건으로 계산할 데이터가 아직 준비되지 않았습니다.')
    }
  }

  const result = analysisResult
  const latestDataDate = result?.effectiveDataUntil ?? '-'
  const selectedRouteText = selectedRoute
    ? `${selectedRoute.originName} ${selectedRoute.originCode} → ${selectedRoute.destinationName} ${selectedRoute.destinationCode}`
    : '-'

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-4 py-5 text-slate-950 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex flex-col gap-1 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xl font-black text-slate-950">유타</div>
            <p className="mt-1 text-sm text-slate-500">두바이유 추세 기반 발권 타이밍</p>
          </div>
        </header>

        <section className="mt-8 rounded-[24px] border border-sky-100 bg-white px-6 py-8 shadow-sm sm:px-9">
          <h1 className="break-keep text-3xl font-black tracking-normal text-slate-950 sm:text-5xl">
            이 날짜에 발권한다면?
          </h1>
          <div className="mt-5 space-y-2 text-base leading-7 text-slate-600 sm:text-lg">
            <p className="break-keep">두바이유와 환율 추세를 기준으로 다음 달 유류할증료 방향성을 참고해요.</p>
            <p className="break-keep">출발일이 아니라 발권일 기준으로 계산됩니다.</p>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-slate-950">여행 정보를 선택해 주세요</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">어디로 가세요?</span>
              <select
                value={selectedCountry}
                onChange={event => handleCountryChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white"
              >
                {routeCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">도시/공항 선택</span>
              <select
                value={selectedDestination}
                onChange={event => handleRouteChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white"
              >
                {currentRoutes.map(route => (
                  <option key={route.destinationCode} value={route.destinationCode}>
                    {route.destinationName} ({route.destinationCode})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">이 날짜에 발권한다면?</span>
              <input
                type="date"
                value={selectedTicketingDate}
                onChange={event => handleTicketingDateChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white"
              />
            </label>

            <button
              type="button"
              onClick={handleAnalyzeClick}
              className="rounded-2xl bg-sky-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-sky-700"
            >
              발권 타이밍 보기
            </button>
          </div>
          <p className="mt-4 break-keep text-sm leading-6 text-slate-500">
            출발지는 인천 ICN으로 고정됩니다. 항공사별 실제 고시 금액이 아니라, 원화 환산 Dubai 가격과 거리구간을 함께 고려한 참고 지표입니다.
          </p>
        </section>

        {error ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</div>
        ) : null}

        {isLoading || !result ? (
          <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
            데이터를 불러오는 중입니다. 잠시만 기다려주세요.
          </section>
        ) : (
          <>
            <section className={`mt-6 rounded-[24px] border p-6 shadow-sm sm:p-8 ${statusStyle[result.status]}`}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-bold shadow-sm">
                    {statusLabel[result.status]}
                  </span>
                  <h2 className="mt-5 break-keep text-2xl font-black leading-tight text-slate-950 sm:text-4xl">
                    {result.title}
                  </h2>
                  <p className="mt-4 max-w-3xl break-keep text-base leading-8 text-slate-700">
                    {result.description}
                  </p>
                  <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-slate-600">
                    실제 항공사 유류할증료 금액이 아니라, 원화 환산 Dubai 가격과 운항거리를 함께 고려한 참고 지표입니다.
                  </p>
                </div>

                <div className="rounded-[20px] bg-white/80 p-5 text-left shadow-sm lg:min-w-[220px]">
                  <div className="text-sm font-semibold text-slate-500">변화율</div>
                  <div className="mt-2 whitespace-nowrap text-4xl font-black text-slate-950">
                    {formatPercent(result.changeRate)}
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    계산에 사용한 최신 데이터일
                    <span className="mt-1 block whitespace-nowrap font-semibold text-slate-800">{latestDataDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-3 rounded-[20px] bg-white/70 p-4 text-sm text-slate-700 md:grid-cols-2">
                <div className="break-keep"><strong className="text-slate-950">선택 노선:</strong> {selectedRouteText}</div>
                <div><strong className="text-slate-950">운항거리:</strong> <span className="whitespace-nowrap">{selectedRoute?.distanceMile.toLocaleString()} mile</span> / <span className="whitespace-nowrap">{selectedRoute?.distanceKm.toLocaleString()} km</span></div>
                <div><strong className="text-slate-950">거리구간:</strong> <span className="whitespace-nowrap">{selectedRoute?.distanceBandLabel}</span></div>
                <div><strong className="text-slate-950">거리 영향도:</strong> <span className="whitespace-nowrap">{result.distanceImpact.level} / {result.distanceImpact.label}</span></div>
              </div>
            </section>

            <KeyMetrics
              currentAverage={`${formatKrw(result.currentPeriod.averageKrw)}원/bbl`}
              currentAverageSub={`${formatUsd(result.currentPeriod.averageUsd)} USD/bbl`}
              nextAverage={`${formatKrw(result.nextPredictionPeriod.averageKrw)}원/bbl`}
              nextAverageSub={`${formatUsd(result.nextPredictionPeriod.averageUsd)} USD/bbl`}
              changeRate={formatPercent(result.changeRate)}
              distanceImpact={`${result.distanceImpact.level} / ${result.distanceImpact.label}`}
              routeAdjustedNext={`${formatRouteIndex(result.routeAdjustedIndex.next)}원/bbl·천마일`}
              confidence={`${result.confidenceProgress}% ${result.confidenceLabel}`}
            />

            <PeriodComparisonTable
              rows={[
                { label: '현재 발권월 기준 기간', value: `${result.currentPeriod.start} ~ ${result.currentPeriod.end}` },
                { label: '다음 발권월 예측 기간', value: `${result.nextPredictionPeriod.start} ~ ${result.nextPredictionPeriod.end}` },
                {
                  label: '직전 산정기간 평균',
                  value: `${formatKrw(result.currentPeriod.averageKrw)}원/bbl`,
                  detail: `${formatUsd(result.currentPeriod.averageUsd)} USD/bbl`,
                },
                {
                  label: '현재 진행기간 평균',
                  value: `${formatKrw(result.nextPredictionPeriod.averageKrw)}원/bbl`,
                  detail: `${formatUsd(result.nextPredictionPeriod.averageUsd)} USD/bbl`,
                },
              ]}
            />

            <TrendChart
              prices={combinedPrices}
              currentPeriod={result.currentPeriod}
              nextPredictionPeriod={result.nextPredictionPeriod}
            />

            <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-slate-950">계산 방법</h2>
              <div className="mt-4 space-y-3 break-keep text-sm leading-7 text-slate-600">
                <p>현재 발권월 기준 기간과 다음 발권월 예측 기간의 원화 환산 Dubai 평균을 비교합니다.</p>
                <p>환율 데이터가 없는 날짜는 직전 유효 USD/KRW 환율을 사용했습니다.</p>
                <p>선택한 목적지의 운항거리와 거리구간은 결과 해석을 돕는 참고 정보로 함께 표시합니다.</p>
              </div>
            </section>
          </>
        )}

        <DataSourceNotice />
      </div>
    </main>
  )
}
