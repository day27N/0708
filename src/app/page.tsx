"use client"

import React, { useEffect, useState } from 'react'
import DataSourceNotice from '../components/DataSourceNotice'
import FeatureCard from '../components/FeatureCard'
import KeyMetrics from '../components/KeyMetrics'
import MiniLineChart from '../components/MiniLineChart'
import OnboardingForm from '../components/OnboardingForm'
import PeriodComparisonTable from '../components/PeriodComparisonTable'
import RouteInputForm from '../components/RouteInputForm'
import SidebarMenu from '../components/SidebarMenu'
import StatusCard from '../components/StatusCard'
import TrendChart from '../components/TrendChart'
import { loadInternalDubaiCsv } from '../data/internalDubaiCsv'
import { defaultRoute, routeCountries, routes } from '../data/routes'
import { loadFxRates } from '../data/fxRates'
import { getCurrentReferencePeriod, getFullNextReferencePeriod, getIssueMonth, getNextPredictionPeriod } from '../lib/dateUtils'
import { analyzeKrwFuelData } from '../lib/dailyAnalysis'
import { combineDubaiWithFx } from '../lib/dubaiFxCombiner'
import { AnalysisResult, DailyDubaiOilPrice, RouteDistance } from '../types/fuel'
import { DailyDubaiKrwPoint, DailyFxRate } from '../types/fx'

const airlineOptions = ['대한항공', '아시아나항공', 'LCC', '외항사']

export default function Page() {
  const todayStr = new Date().toISOString().slice(0, 10)
  const [prices, setPrices] = useState<DailyDubaiOilPrice[]>([])
  const [fxRates, setFxRates] = useState<DailyFxRate[]>([])
  const [combinedPrices, setCombinedPrices] = useState<DailyDubaiKrwPoint[]>([])
  const [selectedTicketingDate, setSelectedTicketingDate] = useState(todayStr)
  const [selectedCountry, setSelectedCountry] = useState(defaultRoute.country)
  const [selectedRoute, setSelectedRoute] = useState<RouteDistance | null>(defaultRoute)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [departure, setDeparture] = useState('인천 (ICN)')
  const [destination, setDestination] = useState(defaultRoute.destinationCode)
  const [travelMonth, setTravelMonth] = useState(new Date().toISOString().slice(0, 7))
  const [airline, setAirline] = useState(airlineOptions[0])

  const formatKrw = (value: number | null) => value === null ? '-' : Math.round(value).toLocaleString()
  const formatRouteIndex = (value: number | null) => value === null ? '-' : `${Math.round(value).toLocaleString()} 원/bbl·천마일`

  const analyzeTicketingDate = async (date: string, route: RouteDistance | null): Promise<AnalysisResult | null> => {
    if (prices.length === 0 || fxRates.length === 0 || combinedPrices.length === 0) return null

    const ticketDate = new Date(date)
    const issueMonth = getIssueMonth(ticketDate)
    const currentPeriod = getCurrentReferencePeriod(issueMonth)
    const nextPredictionPeriod = getNextPredictionPeriod(ticketDate, new Date(prices[prices.length - 1].date))
    const fullNextReferencePeriod = getFullNextReferencePeriod(ticketDate)

    return analyzeKrwFuelData(
      date,
      combinedPrices,
      fxRates[fxRates.length - 1]?.date ?? date,
      route,
      currentPeriod,
      nextPredictionPeriod,
      fullNextReferencePeriod,
      prices[prices.length - 1].date,
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

        const initialResult = analyzeKrwFuelData(
          todayStr,
          combined,
          loadedFx[loadedFx.length - 1]?.date ?? todayStr,
          defaultRoute,
          getCurrentReferencePeriod(getIssueMonth(new Date(todayStr))),
          getNextPredictionPeriod(new Date(todayStr), new Date(loadedPrices[loadedPrices.length - 1].date)),
          getFullNextReferencePeriod(new Date(todayStr)),
          loadedPrices[loadedPrices.length - 1].date,
        )

        setAnalysisResult(initialResult)
      } catch {
        setError('데이터를 불러오지 못했습니다. 다시 시도해주세요.')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [todayStr])

  const handleTicketingDateChange = async (date: string) => {
    setSelectedTicketingDate(date)
    const result = await analyzeTicketingDate(date, selectedRoute)
    if (result) setAnalysisResult(result)
  }

  const handleCountryChange = async (country: string) => {
    setSelectedCountry(country)
    const nextRoute = routes.find(route => route.country === country) ?? defaultRoute
    setSelectedRoute(nextRoute)
    setDestination(nextRoute.destinationCode)
    const result = await analyzeTicketingDate(selectedTicketingDate, nextRoute)
    if (result) setAnalysisResult(result)
  }

  const handleRouteChange = async (destinationCode: string) => {
    const nextRoute = routes.find(route => route.destinationCode === destinationCode)
    if (!nextRoute) return

    setSelectedRoute(nextRoute)
    setSelectedCountry(nextRoute.country)
    setDestination(nextRoute.destinationCode)
    const result = await analyzeTicketingDate(selectedTicketingDate, nextRoute)
    if (result) setAnalysisResult(result)
  }

  const handleAnalyzeClick = async () => {
    if (prices.length === 0 || fxRates.length === 0 || combinedPrices.length === 0) {
      setError('데이터가 아직 준비되지 않았습니다.')
      return
    }

    const result = await analyzeTicketingDate(selectedTicketingDate, selectedRoute)
    if (result) setAnalysisResult(result)
  }

  const handleOnboardingChange = (field: string, value: string) => {
    if (field === 'departure') setDeparture(value)
    if (field === 'destination') setDestination(value)
    if (field === 'month') setTravelMonth(value)
    if (field === 'airline') setAirline(value)
  }

  const handleOnboardingSubmit = async () => {
    const nextRoute = routes.find(route => route.destinationCode === destination) ?? selectedRoute ?? defaultRoute
    setSelectedRoute(nextRoute)
    setSelectedCountry(nextRoute.country)

    const result = await analyzeTicketingDate(selectedTicketingDate, nextRoute)
    if (result) setAnalysisResult(result)
  }

  const recentTrend = combinedPrices.slice(-24).map(point => ({
    date: point.date,
    value: point.dubaiKrwPerBarrel,
  }))

  const recommendation = analysisResult?.status === 'BUY_NOW'
    ? '지금 발권'
    : analysisResult?.status === 'WAIT'
      ? '기다려보기'
      : '중립'

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          <SidebarMenu />

          <section className="space-y-8">
            <section className="rounded-[32px] bg-sky-600 px-6 py-8 text-white shadow-[0_24px_80px_-40px_rgba(14,165,233,0.55)] sm:px-10">
              <div className="max-w-3xl">
                <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
                  Uta Fuel Cost
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                  발권 타이밍과 유류할증료 흐름을 한눈에
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-sky-100/90">
                  두바이유와 환율 데이터를 결합해 노선별 거리 영향을 반영하고, 오늘 발권해도 좋은지 빠르게 판단할 수 있게 정리합니다.
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FeatureCard
                    icon="₩"
                    title="환화 환산 추세"
                    description="Dubai 유가와 원/달러 환율을 결합해 KRW/bbl 기준으로 비교합니다."
                  />
                  <FeatureCard
                    icon="↗"
                    title="노선별 거리 참고"
                    description="목적지별 운항거리와 거리구간을 함께 보여 발권 판단에 필요한 맥락을 더합니다."
                  />
                  <FeatureCard
                    icon="✓"
                    title="발권 시점 제안"
                    description="선택한 발권일 기준으로 현재 산정기간과 다음 예측기간을 비교합니다."
                  />
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Onboarding</div>
                      <h2 className="mt-3 text-2xl font-bold text-slate-950">여행 정보를 입력해보세요</h2>
                    </div>
                    <div className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-600">{airline} 선택</div>
                  </div>

                  <OnboardingForm
                    departure={departure}
                    destination={destination}
                    month={travelMonth}
                    airline={airline}
                    routes={routes}
                    airlines={airlineOptions}
                    onChange={handleOnboardingChange}
                    onSubmit={handleOnboardingSubmit}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Dashboard</div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <StatusCard
                      label="현재 추천"
                      value={recommendation}
                      tone={analysisResult?.status === 'BUY_NOW' ? 'primary' : analysisResult?.status === 'WAIT' ? 'warning' : 'neutral'}
                      active
                    />
                    <StatusCard
                      label="선택 노선"
                      value={selectedRoute ? `${selectedRoute.city} (${selectedRoute.destinationCode})` : '-'}
                      detail={selectedRoute?.distanceBandLabel}
                    />
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm uppercase tracking-[0.24em] text-slate-500">최근 24개 추세</div>
                      <p className="mt-2 text-lg font-semibold text-slate-900">KRW/bbl</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {combinedPrices.length > 0 ? `${combinedPrices[combinedPrices.length - 1].date} 기준` : '데이터 준비 중'}
                    </div>
                  </div>
                  <div className="mt-5">
                    <MiniLineChart data={recentTrend} />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_420px]">
              <div className="space-y-6">
                <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm uppercase tracking-[0.24em] text-slate-500">분석 결과</div>
                      <h2 className="mt-3 text-3xl font-bold text-slate-950">발권 타이밍 인사이트</h2>
                    </div>
                    <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      발권일
                      <input
                        type="date"
                        value={selectedTicketingDate}
                        onChange={event => handleTicketingDateChange(event.target.value)}
                        className="ml-3 rounded-2xl border border-slate-200 bg-white px-3 py-2"
                      />
                    </div>
                  </div>

                  {error ? (
                    <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
                  ) : null}

                  {isLoading || !analysisResult ? (
                    <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-slate-500">
                      데이터를 불러오는 중입니다. 잠시만 기다려주세요.
                    </div>
                  ) : (
                    <>
                      <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <StatusCard label="변화율" value={analysisResult.changeRate === null ? '-' : `${analysisResult.changeRate.toFixed(2)}%`} />
                        <StatusCard label="신뢰도" value={`${analysisResult.confidenceProgress}%`} detail={analysisResult.confidenceLabel} />
                        <StatusCard label="대상 기간" value={`${analysisResult.currentPeriod.start} ~ ${analysisResult.nextPredictionPeriod.end}`} />
                      </div>

                      <div className="mt-8">
                        <KeyMetrics
                          currentAverage={formatKrw(analysisResult.currentPeriod.averageKrw)}
                          nextAverage={formatKrw(analysisResult.nextPredictionPeriod.averageKrw)}
                          routeAdjustedCurrent={formatRouteIndex(analysisResult.routeAdjustedIndex.current)}
                          routeAdjustedNext={formatRouteIndex(analysisResult.routeAdjustedIndex.next)}
                          changeRate={analysisResult.changeRate === null ? '-' : `${analysisResult.changeRate.toFixed(2)}%`}
                          confidence={`${analysisResult.confidenceProgress}% (${analysisResult.confidenceLabel})`}
                        />
                      </div>

                      <div className="mt-8">
                        <PeriodComparisonTable
                          rows={[
                            { label: '현재 발권월 기준 기간', value: `${analysisResult.currentPeriod.start} ~ ${analysisResult.currentPeriod.end}` },
                            { label: '다음 발권월 예측 기간', value: `${analysisResult.nextPredictionPeriod.start} ~ ${analysisResult.nextPredictionPeriod.end}` },
                            { label: '직전 산정기간 평균 (KRW/bbl)', value: formatKrw(analysisResult.currentPeriod.averageKrw) },
                            { label: '현재 진행 기간 평균 (KRW/bbl)', value: formatKrw(analysisResult.nextPredictionPeriod.averageKrw) },
                          ]}
                        />
                      </div>
                    </>
                  )}
                </section>

                {!isLoading && analysisResult ? (
                  <TrendChart
                    prices={combinedPrices}
                    currentPeriod={analysisResult.currentPeriod}
                    nextPredictionPeriod={analysisResult.nextPredictionPeriod}
                  />
                ) : null}
              </div>

              <aside className="space-y-6">
                <RouteInputForm
                  countries={routeCountries}
                  routes={routes}
                  selectedCountry={selectedCountry}
                  selectedRoute={selectedRoute}
                  onCountryChange={handleCountryChange}
                  onRouteChange={handleRouteChange}
                />

                <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="text-sm uppercase tracking-[0.24em] text-slate-500">현재 요약</div>
                  <p className="mt-4 leading-7 text-slate-700">
                    유류할증료는 실제 항공사 고시표와 운항거리 구간에 따라 달라질 수 있습니다. 이 화면은 두바이유 가격과 환율 흐름을 바탕으로 발권 판단을 돕는 참고 지표입니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleAnalyzeClick}
                    className="mt-5 w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    선택 조건으로 다시 분석
                  </button>
                </div>
              </aside>
            </section>

            <DataSourceNotice />
          </section>
        </div>
      </div>
    </main>
  )
}
