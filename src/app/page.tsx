"use client"

import React, { useEffect, useState } from 'react'
import DataSourceNotice from '../components/DataSourceNotice'
import KeyMetrics from '../components/KeyMetrics'
import PeriodComparisonTable from '../components/PeriodComparisonTable'
import TrendChart from '../components/TrendChart'
import { loadInternalDubaiCsv } from '../data/internalDubaiCsv'
import { routeCountries, routes } from '../data/routes'
import { loadFxRates } from '../data/fxRates'
import { getCurrentReferencePeriod, getFullNextReferencePeriod, getIssueMonth, getNextPredictionPeriod } from '../lib/dateUtils'
import { analyzeKrwFuelData } from '../lib/dailyAnalysis'
import { combineDubaiWithFx } from '../lib/dubaiFxCombiner'
import { trackBookingCtaClick, trackTaskCompletion } from '../lib/analytics'
import { AnalysisResult, DailyDubaiOilPrice, RouteDistance } from '../types/fuel'
import { DailyDubaiKrwPoint, DailyFxRate } from '../types/fx'

const statusLabel = {
  BUY_NOW: '지금 발권 유리',
  WAIT: '기다리기 고려',
  WEAK_SIGNAL: '방향성 있음',
  NEUTRAL: '큰 차이 없음',
  INSUFFICIENT_DATA: '데이터 부족',
} as const

const statusStyle = {
  BUY_NOW: 'border-sky-100 bg-sky-50 text-sky-800',
  WAIT: 'border-emerald-100 bg-emerald-50 text-emerald-800',
  WEAK_SIGNAL: 'border-blue-100 bg-blue-50 text-blue-800',
  NEUTRAL: 'border-slate-100 bg-slate-50 text-slate-700',
  INSUFFICIENT_DATA: 'border-amber-100 bg-amber-50 text-amber-800',
} as const

const bookingSites = [
  { name: '네이버 항공권', href: 'https://flight.naver.com/' },
  { name: '스카이스캐너', href: 'https://www.skyscanner.co.kr/' },
  { name: '구글 항공권', href: 'https://www.google.com/travel/flights' },
  { name: '트립닷컴', href: 'https://kr.trip.com/flights/' },
  { name: '대한항공', href: 'https://www.koreanair.com/' },
  { name: '아시아나', href: 'https://flyasiana.com/' },
]

const useCases = [
  {
    title: '항공권을 지금 살지 고민될 때',
    description: '다음 달 유류할증료 방향성을 보고 발권 타이밍을 참고할 수 있어요.',
  },
  {
    title: '장거리 노선이라 유류비 부담이 걱정될 때',
    description: '미국, 유럽처럼 운항거리가 긴 노선은 유류비 변화가 더 크게 느껴질 수 있어요.',
  },
  {
    title: '유류할증료 변동 흐름을 보고 싶을 때',
    description: '두바이유와 환율을 함께 반영해 원화 기준 유류비 흐름을 확인할 수 있어요.',
  },
]

const sampleTrips = [
  { label: '도쿄 여행', country: '일본', destinationCode: 'NRT' },
  { label: '방콕 여행', country: '태국', destinationCode: 'BKK' },
  { label: 'LA 여행', country: '미국', destinationCode: 'LAX' },
  { label: '파리 여행', country: '프랑스', destinationCode: 'CDG' },
]

function formatKrw(value: number | null) {
  return value === null ? '-' : Math.round(value).toLocaleString()
}

function formatUsd(value: number | null) {
  return value === null ? '-' : value.toFixed(2)
}

function formatPercent(value: number | null) {
  return value === null ? '-' : `${value.toFixed(2)}%`
}

function formatSignedRouteImpact(result: AnalysisResult) {
  const impact = result.impactAmount.estimatedRouteImpactKrw
  const delta = result.impactAmount.deltaKrwPerBarrel
  if (impact === null || delta === null) return '-'

  const signedImpact = delta < 0 ? -impact : impact
  return `약 ${Math.round(signedImpact).toLocaleString()}원`
}

function getDirectionText(deltaKrwPerBarrel: number | null) {
  if (deltaKrwPerBarrel === null) return '-'
  if (deltaKrwPerBarrel > 0) return '지금 발권 쪽으로 기울 수 있어요'
  if (deltaKrwPerBarrel < 0) return '기다리는 쪽으로 기울 수 있어요'
  return '방향성은 거의 중립입니다'
}

function getRouteImpactTrendText(deltaKrwPerBarrel: number | null) {
  if (deltaKrwPerBarrel === null) return '방향성 확인이 필요해요'
  if (deltaKrwPerBarrel > 0) return '비용이 오르는 추세'
  if (deltaKrwPerBarrel < 0) return '비용이 내려가는 추세'
  return '비용 변화가 거의 없음'
}

function getImpactJudgment(result: AnalysisResult) {
  const impact = result.impactAmount.estimatedRouteImpactKrw
  const threshold = result.impactAmount.significantThresholdKrw
  if (impact === null) return '계산에 필요한 데이터가 부족합니다.'
  if (impact >= threshold) {
    return `5만 원 이상 차이로 판단되어, 유류비 관점에서는 ${result.impactAmount.deltaKrwPerBarrel !== null && result.impactAmount.deltaKrwPerBarrel < 0 ? '기다리는 전략도 가능해요.' : '지금 발권이 유리할 수 있어요.'}`
  }
  return '방향성은 보이지만, 5만 원 기준에는 못 미쳐요.'
}

function BrandMark() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-sky-100 bg-white shadow-sm">
        <span aria-hidden="true" className="text-3xl leading-none">🛬</span>
      </div>
      <div className="pt-0.5">
        <div className="text-[1.75rem] font-black leading-[1.05] text-[#0F2742] sm:text-[1.9rem]">유타</div>
        <p className="mt-1 text-[0.92rem] font-medium leading-[1.45] text-slate-600">두바이유 추세 기반 발권 타이밍</p>
      </div>
    </div>
  )
}

function BalancedResultTitle({ title }: { title: string }) {
  const [prefix, ...rest] = title.split(', ')
  const suffix = rest.join(', ')

  if (!suffix) {
    return <>{title}</>
  }

  return (
    <>
      <span className="block">{prefix},</span>
      <span className="mt-1 block">{suffix}</span>
    </>
  )
}

export default function Page() {
  const todayStr = new Date().toISOString().slice(0, 10)
  const [prices, setPrices] = useState<DailyDubaiOilPrice[]>([])
  const [fxRates, setFxRates] = useState<DailyFxRate[]>([])
  const [combinedPrices, setCombinedPrices] = useState<DailyDubaiKrwPoint[]>([])
  const [selectedTicketingDate, setSelectedTicketingDate] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedRoute, setSelectedRoute] = useState<RouteDistance | null>(null)
  const [selectedDestination, setSelectedDestination] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentRoutes = selectedCountry ? routes.filter(route => route.country === selectedCountry) : []
  const canAnalyze = selectedRoute !== null && selectedTicketingDate !== ''

  const runAnalysis = (
    date: string,
    route: RouteDistance | null,
    sourcePrices = prices,
    sourceFxRates = fxRates,
    sourceCombinedPrices = combinedPrices,
  ) => {
    if (!date || !route || sourcePrices.length === 0 || sourceFxRates.length === 0 || sourceCombinedPrices.length === 0) return null

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
      } catch {
        setError('데이터를 불러오지 못했습니다. 다시 시도해주세요.')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    setSelectedRoute(null)
    setSelectedDestination('')
    setAnalysisResult(null)
    setError(null)
  }

  const handleRouteChange = (destinationCode: string) => {
    const nextRoute = routes.find(route => route.destinationCode === destinationCode)
    if (!nextRoute) return

    setSelectedDestination(destinationCode)
    setSelectedRoute(nextRoute)
    setSelectedCountry(nextRoute.country)
    setError(null)
    setAnalysisResult(null)
  }

  const handleTicketingDateChange = (date: string) => {
    setSelectedTicketingDate(date)
    setError(null)
    setAnalysisResult(null)
  }

  const handleAnalyzeClick = () => {
    if (!canAnalyze) {
      setAnalysisResult(null)
      setError('지역과 발권일을 먼저 선택해주세요.')
      return
    }

    const result = runAnalysis(selectedTicketingDate, selectedRoute)
    if (result) {
      setError(null)
      setAnalysisResult(result)
      if (selectedRoute) {
        trackTaskCompletion({
          country: selectedRoute.country,
          destinationCode: selectedRoute.destinationCode,
          destinationName: selectedRoute.destinationName,
          ticketingDate: selectedTicketingDate,
          resultStatus: result.status,
          inputMethod: 'manual',
        })
      }
    } else {
      setError('선택한 조건으로 계산할 데이터가 아직 준비되지 않았습니다.')
    }
  }

  const handleSampleClick = (country: string, destinationCode: string) => {
    const nextRoute = routes.find(route => route.destinationCode === destinationCode)
    if (!nextRoute) return

    const nextDate = prices[prices.length - 1]?.date ?? todayStr
    setSelectedCountry(country)
    setSelectedRoute(nextRoute)
    setSelectedDestination(nextRoute.destinationCode)
    setSelectedTicketingDate(nextDate)

    const result = runAnalysis(nextDate, nextRoute)
    if (result) {
      setError(null)
      setAnalysisResult(result)
      trackTaskCompletion({
        country: nextRoute.country,
        destinationCode: nextRoute.destinationCode,
        destinationName: nextRoute.destinationName,
        ticketingDate: nextDate,
        resultStatus: result.status,
        inputMethod: 'sample',
      })
    }
  }

  const result = analysisResult
  const latestDataDate = result?.effectiveDataUntil ?? '-'
  const selectedRouteText = selectedRoute
    ? `${selectedRoute.originName} ${selectedRoute.originCode} → ${selectedRoute.destinationName} ${selectedRoute.destinationCode}`
    : '-'
  const routeDistanceText = selectedRoute
    ? `${selectedRoute.distanceMile.toLocaleString()} mile / ${selectedRoute.distanceKm.toLocaleString()} km`
    : '-'

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-4 py-5 text-slate-950 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex items-center justify-between border-b border-slate-200/80 pb-6 pt-1">
          <BrandMark />
        </header>

        <section className="mt-8 rounded-[28px] border border-sky-100 bg-gradient-to-br from-white to-sky-50/70 px-6 py-8 shadow-sm sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-sky-100 bg-white/80 px-3.5 py-1.5 text-sm font-bold text-sky-700 shadow-sm">
              유타 발권 타이밍
            </div>
            <h1 className="max-w-[620px] break-keep text-[1.75rem] font-black leading-[1.22] tracking-normal text-slate-950 sm:text-[2.25rem]">
              이 날짜에 발권한다면?
            </h1>
            <div className="mt-5 max-w-[720px] space-y-2 text-[1.02rem] leading-8 text-slate-600">
              <p className="break-keep">두바이유와 환율 추세를 기준으로 다음 달 유류할증료 방향성을 참고해요.</p>
              <p className="break-keep">출발일이 아니라 발권일 기준으로 계산됩니다.</p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-bold text-slate-950">이럴 때 써요</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {useCases.map(item => (
              <div key={item.title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="break-keep text-base font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 break-keep text-sm leading-6 text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50/70 p-5 shadow-md shadow-sky-100/70 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-bold text-sky-700 shadow-sm">
                핵심 입력
              </div>
              <h2 className="text-[1.35rem] font-black text-slate-950">여행 정보를 선택해 주세요</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">목적지와 발권일만 고르면 바로 결과를 볼 수 있어요.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 rounded-[24px] border border-sky-100 bg-white/90 p-4 shadow-sm md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_180px] lg:items-end">
            <label className="block">
              <span className="text-sm font-bold text-slate-800">어디로 가세요?</span>
              <select
                value={selectedCountry}
                onChange={event => handleCountryChange(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 text-[0.95rem] font-semibold text-slate-950 outline-none transition hover:border-sky-200 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                <option value="">선택</option>
                {routeCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-800">도시/공항 선택</span>
              <select
                value={selectedDestination}
                onChange={event => handleRouteChange(event.target.value)}
                disabled={!selectedCountry}
                className="mt-2 h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 text-[0.95rem] font-semibold text-slate-950 outline-none transition hover:border-sky-200 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:border-slate-200 disabled:bg-slate-50 disabled:font-medium disabled:text-slate-500"
              >
                <option value="">{selectedCountry ? '도시/공항을 선택해 주세요' : '지역을 선택해주세요'}</option>
                {currentRoutes.map(route => (
                  <option key={route.destinationCode} value={route.destinationCode}>
                    {route.destinationName} ({route.destinationCode})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-800">이 날짜에 발권한다면?</span>
              <input
                type="date"
                value={selectedTicketingDate}
                onChange={event => handleTicketingDateChange(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 text-[0.95rem] font-semibold text-slate-950 outline-none transition hover:border-sky-200 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={!canAnalyze}
              className="h-12 rounded-2xl bg-sky-600 px-5 text-[0.95rem] font-black text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0"
            >
              발권 타이밍 보기
            </button>
          </div>
          <p className="mt-4 break-keep text-sm font-medium leading-6 text-slate-600">
            출발지는 인천 ICN으로 고정됩니다. 항공사별 실제 고시 금액이 아니라, 원화 환산 Dubai 가격과 거리구간을 함께 고려한 참고 지표입니다.
          </p>
          <div className="mt-6 rounded-[24px] border border-sky-200 bg-white/75 p-4 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950">바로 체험해보기</h3>
                <p className="mt-1 break-keep text-sm leading-6 text-slate-500">샘플을 누르면 목적지와 발권일이 바뀌고 결과가 다시 계산됩니다.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {sampleTrips.map(sample => (
                <button
                  key={sample.destinationCode}
                  type="button"
                  onClick={() => handleSampleClick(sample.country, sample.destinationCode)}
                  className="rounded-2xl border-2 border-white bg-white px-4 py-3 text-left text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-100 active:translate-y-0"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</div>
        ) : null}

        {isLoading ? (
          <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
            데이터를 불러오는 중입니다. 잠시만 기다려주세요.
          </section>
        ) : !result ? (
          <section className="mt-6 rounded-[28px] border border-sky-100 bg-gradient-to-br from-white to-sky-50/60 p-6 shadow-sm sm:p-8">
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-700 shadow-sm">
              지역을 선택해주세요
            </span>
            <h2 className="mt-5 break-keep text-[1.4rem] font-extrabold leading-[1.35] text-slate-950 sm:text-[1.8rem]">
              목적지와 발권일을 고르면 결과가 표시돼요
            </h2>
            <p className="mt-3 max-w-[680px] break-keep text-sm leading-7 text-slate-600">
              어디로 가는지와 발권일을 선택하면 유류비 관점의 발권 타이밍, 거리반영 참고 영향액, 추세 차트를 바로 확인할 수 있습니다.
            </p>
          </section>
        ) : (
          <>
            <section className={`mt-6 rounded-[28px] border p-6 shadow-sm sm:p-8 ${statusStyle[result.status]}`}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-bold shadow-sm">
                    {statusLabel[result.status]}
                  </span>
                  <h2 className="mt-5 max-w-[660px] break-keep text-[1.45rem] font-extrabold leading-[1.35] tracking-normal text-slate-950 sm:text-[1.9rem] lg:text-[2.05rem]">
                    <BalancedResultTitle title={result.title} />
                  </h2>
                  <p className="mt-4 max-w-[760px] break-keep text-[0.98rem] leading-8 text-slate-700">
                    {result.description}
                  </p>
                  <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/70 p-4">
                      <div className="font-semibold text-slate-500">거리반영 참고 영향액</div>
                      <div className="mt-2 text-xl font-black text-slate-950">{formatSignedRouteImpact(result)}</div>
                      <div className="mt-1 break-keep text-xs font-semibold text-slate-500">
                        {getRouteImpactTrendText(result.impactAmount.deltaKrwPerBarrel)} · 편도 기준
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-4">
                      <div className="font-semibold text-slate-500">방향성</div>
                      <div className="mt-2 break-keep font-bold text-slate-950">{getDirectionText(result.impactAmount.deltaKrwPerBarrel)}</div>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-4">
                      <div className="font-semibold text-slate-500">변화율</div>
                      <div className="mt-2 font-bold text-slate-950">{formatPercent(result.changeRate)}</div>
                    </div>
                  </div>
                  <p className="mt-4 max-w-[760px] break-keep text-sm leading-6 text-slate-600">
                    5만 원 이상이면 유의미한 차이로 판단합니다. 거리반영 참고 영향액은 실제 유류할증료 금액이 아니라, 원화 환산 Dubai 가격 변화와 노선 운항거리를 결합한 편도 기준 참고 지표입니다.
                  </p>
                </div>

                <div className="rounded-[22px] bg-white/80 p-5 text-left shadow-sm lg:mt-10 lg:min-w-[210px]">
                  <div className="text-sm font-semibold text-slate-500">판단</div>
                  <div className="mt-2 break-keep text-base font-bold leading-7 text-slate-950">
                    {getImpactJudgment(result)}
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    계산에 사용한 최신 데이터일
                    <span className="mt-1 block whitespace-nowrap font-semibold text-slate-800">{latestDataDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-3 rounded-[22px] bg-white/75 p-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white/70 p-3">
                  <div className="text-xs font-semibold text-slate-500">선택 노선</div>
                  <div className="mt-1 break-keep font-bold text-slate-950">{selectedRouteText}</div>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                  <div className="text-xs font-semibold text-slate-500">운항거리</div>
                  <div className="mt-1 font-bold text-slate-950"><span className="whitespace-nowrap">{routeDistanceText}</span></div>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                  <div className="text-xs font-semibold text-slate-500">거리구간</div>
                  <div className="mt-1 whitespace-nowrap font-bold text-slate-950">{selectedRoute?.distanceBandLabel}</div>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                  <div className="text-xs font-semibold text-slate-500">거리 영향도</div>
                  <div className="mt-1 whitespace-nowrap font-bold text-slate-950">{result.distanceImpact.level} / {result.distanceImpact.label}</div>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-slate-950">결과를 이렇게 해석해요</h2>
              <p className="mt-3 break-keep text-sm leading-7 text-slate-600">
                유타는 실제 항공권 가격을 예측하는 서비스가 아니라, 유류비 관점에서 발권 타이밍을 참고하는 도구입니다. 단거리 노선은 변화율이 커도 체감 영향이 작을 수 있고, 장거리 노선은 같은 변화율이라도 편도 기준 거리반영 참고 영향액이 커질 수 있습니다.
              </p>
            </section>

            <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
              <TrendChart
                prices={combinedPrices}
                currentPeriod={result.currentPeriod}
                nextPredictionPeriod={result.nextPredictionPeriod}
              />

              <section className="flex h-full min-h-[360px] flex-col rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">바로 예매 사이트로 이동</h2>
                  <p className="mt-2 break-keep text-sm leading-6 text-slate-500">
                    원유가격 참고 후, 실제 항공권 검색은 아래 사이트에서 바로 이어서 할 수 있습니다.
                  </p>
                </div>
                <div className="mt-5 grid flex-1 content-start gap-3 sm:grid-cols-2">
                  {bookingSites.map(site => (
                    <a
                      key={site.name}
                      href={site.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackBookingCtaClick(site.name)}
                      className="group flex min-h-[52px] items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 focus:outline-none focus:ring-4 focus:ring-sky-100 active:translate-y-0"
                    >
                      <span>{site.name}</span>
                      <span className="text-slate-400 transition group-hover:text-sky-600">↗</span>
                    </a>
                  ))}
                </div>
              </section>
            </div>

            <KeyMetrics
              routeImpactAmount={formatSignedRouteImpact(result)}
              routeImpactTrend={`${getRouteImpactTrendText(result.impactAmount.deltaKrwPerBarrel)} · 편도 기준`}
              currentAverage={`${formatKrw(result.currentPeriod.averageKrw)}원/bbl`}
              currentAverageSub={`${formatUsd(result.currentPeriod.averageUsd)} USD/bbl`}
              nextAverage={`${formatKrw(result.nextPredictionPeriod.averageKrw)}원/bbl`}
              nextAverageSub={`${formatUsd(result.nextPredictionPeriod.averageUsd)} USD/bbl`}
              changeRate={formatPercent(result.changeRate)}
              routeDistance={routeDistanceText}
              distanceBand={selectedRoute?.distanceBandLabel ?? '-'}
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

            <section className="mt-6 rounded-[26px] border border-slate-200 bg-[#FBFDFF] p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-slate-950">계산 방법</h2>
              <div className="mt-4 space-y-3 break-keep text-sm leading-7 text-slate-600">
                <div>
                  <h3 className="font-bold text-slate-800">유타는 어떤 용도인가요?</h3>
                  <p className="mt-1">유타는 항공권 최저가 검색기가 아닙니다. 두바이유, USD/KRW 환율, 운항거리를 함께 참고해 유류할증료 방향성을 보는 발권 타이밍 참고 도구입니다.</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                    <li className="rounded-2xl bg-white p-3 shadow-sm">지금 발권하는 게 유류비 관점에서 유리할까?</li>
                    <li className="rounded-2xl bg-white p-3 shadow-sm">다음 달까지 기다리면 부담이 줄어들 가능성이 있을까?</li>
                    <li className="rounded-2xl bg-white p-3 shadow-sm">장거리 노선이라 변화가 더 크게 체감될까?</li>
                  </ul>
                </div>
                <p>현재 발권월 기준 기간과 다음 발권월 예측 기간의 원화 환산 Dubai 평균을 비교합니다.</p>
                <p>환율 데이터가 없는 날짜는 직전 유효 USD/KRW 환율을 사용했습니다.</p>
                <p>선택한 목적지의 운항거리와 거리구간은 결과 해석을 돕는 참고 정보로 함께 표시합니다.</p>
                <div>
                  <h3 className="font-bold text-slate-800">왜 5만 원 기준을 쓰나요?</h3>
                  <p className="mt-1">유류비 지표의 변화율이 커도 단거리 노선에서는 실제 체감 차이가 작을 수 있습니다. 그래서 유타는 원화 환산 Dubai 변화폭에 선택 노선의 운항거리를 반영한 편도 기준 참고 영향액을 계산하고, 5만 원 이상일 때 유의미한 차이로 표시합니다.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">실제 유류할증료 금액인가요?</h3>
                  <p className="mt-1">아닙니다. 이 값은 실제 항공사별 유류할증료 고시 금액이 아닙니다. Dubai 가격, USD/KRW 환율, 노선 운항거리를 결합한 편도 기준 참고 지표입니다. 실제 금액은 항공사별 고시표와 거리구간에 따라 달라질 수 있습니다.</p>
                </div>
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-[26px] border border-sky-100 bg-[#F8FBFF] shadow-sm">
              <div className="border-l-4 border-sky-400 p-6 sm:p-7">
                <h2 className="text-lg font-bold text-slate-950">이용 전 참고사항</h2>
                <ul className="mt-4 space-y-3.5 break-keep text-sm leading-7 text-slate-600">
                  <li>이 앱은 실제 항공권 가격 예측 서비스가 아닙니다.</li>
                  <li>실제 항공사 유류할증료 고시표를 직접 반영하지 않습니다.</li>
                  <li>환율, 항공사 정책, 거리 구간, 발권일 기준 고시금액 등 실제 결제 요소와 차이가 있을 수 있습니다.</li>
                  <li>원유가격은 유류할증료 흐름을 참고하기 위한 간접 지표입니다.</li>
                  <li>실제 결제 전 항공사 또는 예매처의 유류할증료와 총 결제금액을 확인하세요.</li>
                </ul>
              </div>
            </section>
          </>
        )}

        <DataSourceNotice />
      </div>
    </main>
  )
}
