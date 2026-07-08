"use client"
import React, { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import RouteInputForm from '../components/RouteInputForm'
import TrendChart from '../components/TrendChart'
import PeriodComparisonTable from '../components/PeriodComparisonTable'
import DataSourceNotice from '../components/DataSourceNotice'
import KeyMetrics from '../components/KeyMetrics'
import { DailyDubaiOilPrice, AnalysisResult, RouteDistance } from '../types/fuel'
import { DailyDubaiKrwPoint, DailyFxRate } from '../types/fx'
import { getIssueMonth, getCurrentReferencePeriod, getNextPredictionPeriod, getFullNextReferencePeriod } from '../lib/dateUtils'
import { loadInternalDubaiCsv } from '../data/internalDubaiCsv'
import { loadFxRates } from '../data/fxRates'
import { combineDubaiWithFx } from '../lib/dubaiFxCombiner'
import { analyzeKrwFuelData } from '../lib/dailyAnalysis'
import { routes, routeCountries, defaultRoute } from '../data/routes'

export default function Page(){
  const todayStr = new Date().toISOString().slice(0,10)
  const [prices, setPrices] = useState<DailyDubaiOilPrice[]>([])
  const [fxRates, setFxRates] = useState<DailyFxRate[]>([])
  const [combinedPrices, setCombinedPrices] = useState<DailyDubaiKrwPoint[]>([])
  const [selectedTicketingDate, setSelectedTicketingDate] = useState<string>(todayStr)
  const [selectedCountry, setSelectedCountry] = useState<string>('일본')
  const [selectedRoute, setSelectedRoute] = useState<RouteDistance | null>(defaultRoute)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const formatKrw = (value: number | null) => value === null ? '-' : Math.round(value).toLocaleString()
  const formatRouteIndex = (value: number | null) => value === null ? '-' : `${Math.round(value).toLocaleString()}원/bbl·천마일`

  const analyzeTicketingDate = async (date: string, route: RouteDistance | null): Promise<AnalysisResult | null> => {
    if (prices.length === 0 || fxRates.length === 0 || combinedPrices.length === 0) {
      return null
    }

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

        const initialResult = await analyzeKrwFuelData(
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
      } catch (e) {
        setError('데이터를 불러오지 못했습니다. 다시 시도해주세요.')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const handleTicketingDateChange = async (date: string) => {
    setSelectedTicketingDate(date)
    if (prices.length > 0 && fxRates.length > 0 && combinedPrices.length > 0) {
      const result = await analyzeTicketingDate(date, selectedRoute)
      if (result) setAnalysisResult(result)
    }
  }

  const handleCountryChange = async (country: string) => {
    setSelectedCountry(country)
    const nextRoute = routes.find(route => route.country === country) ?? defaultRoute
    setSelectedRoute(nextRoute)
    if (prices.length > 0 && fxRates.length > 0 && combinedPrices.length > 0) {
      const result = await analyzeTicketingDate(selectedTicketingDate, nextRoute)
      if (result) setAnalysisResult(result)
    }
  }

  const handleRouteChange = async (destinationCode: string) => {
    const nextRoute = routes.find(route => route.destinationCode === destinationCode)
    if (nextRoute) {
      setSelectedRoute(nextRoute)
      if (prices.length > 0 && fxRates.length > 0 && combinedPrices.length > 0) {
        const result = await analyzeTicketingDate(selectedTicketingDate, nextRoute)
        if (result) setAnalysisResult(result)
      }
    }
  }

  const handleAnalyzeClick = async () => {
    if (prices.length === 0 || fxRates.length === 0 || combinedPrices.length === 0) {
      setError('데이터가 아직 준비되지 않았습니다.')
      return
    }
    const result = await analyzeTicketingDate(selectedTicketingDate, selectedRoute)
    if (result) setAnalysisResult(result)
  }

  const statusColor = analysisResult?.status === 'BUY_NOW' ? 'from-orange-200 via-orange-100 to-orange-50 border-orange-300' : analysisResult?.status === 'WAIT' ? 'from-emerald-200 via-emerald-100 to-emerald-50 border-emerald-300' : 'from-slate-200 via-slate-100 to-yellow-50 border-slate-300'

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white text-sm font-semibold">유타</div>
            <p className="mt-3 text-slate-600">두바이유 추세 기반 발권 타이밍</p>
          </div>
        </header>

        <section className="mb-8">
          <Hero />
        </section>

        <section className="grid gap-6">
          <RouteInputForm
            countries={routeCountries}
            routes={routes}
            selectedCountry={selectedCountry}
            selectedRoute={selectedRoute}
            onCountryChange={handleCountryChange}
            onRouteChange={handleRouteChange}
          />

          <div className="rounded-[28px] bg-white shadow-sm border border-slate-200 p-6">
            <div className="text-sm text-slate-500 font-medium mb-2">이 날짜에 발권한다면?</div>
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1">
                <input type="date" className="w-full rounded-3xl border hairline bg-white px-4 py-3 text-base" value={selectedTicketingDate} onChange={e => handleTicketingDateChange(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={handleAnalyzeClick}>발권 타이밍 보기</button>
            </div>
            <div className="mt-3 text-sm text-slate-500">선택한 날짜: {selectedTicketingDate}</div>
          </div>

          {error && <div className="rounded-3xl bg-rose-50 border border-rose-200 text-rose-700 p-4">{error}</div>}

          {isLoading || !analysisResult ? (
            <div className="rounded-[32px] bg-white shadow-sm border border-slate-200 p-8 text-center text-slate-500">데이터를 불러오는 중입니다...</div>
          ) : (
            <>
              <div className={`rounded-[32px] border p-8 shadow-sm color-block-section-cream`}> 
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                  <div>
                    <div className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">{analysisResult.status === 'BUY_NOW' ? '지금 발권 유리' : analysisResult.status === 'WAIT' ? '기다리기 고려' : '중립'}</div>
                    <h2 className="mt-5 text-3xl sm:text-4xl font-bold text-slate-950">{analysisResult.title}</h2>
                    <p className="mt-4 text-slate-700 text-base max-w-2xl">{analysisResult.description}</p>
                  </div>
                  <div className="rounded-3xl bg-white/90 border border-slate-200 p-6 text-center min-w-[180px]">
                    <div className="text-sm text-slate-500">변화율</div>
                    <div className="mt-3 text-4xl font-bold text-slate-950">{analysisResult.changeRate === null ? '-' : `${analysisResult.changeRate.toFixed(2)}%`}</div>
                    <div className="mt-3 text-sm text-slate-500">신뢰도 {analysisResult.confidenceProgress}% ({analysisResult.confidenceLabel})</div>
                    <div className="mt-2 text-xs text-slate-500">데이터 기준일: {analysisResult.effectiveDataUntil}</div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-3xl bg-white p-4 border border-slate-200">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">현재 발권월 기준</div>
                    <div className="mt-3 text-base text-slate-900">{analysisResult.currentPeriod.start} ~ {analysisResult.currentPeriod.end}</div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 border border-slate-200">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">다음 발권월 예측</div>
                    <div className="mt-3 text-base text-slate-900">{analysisResult.nextPredictionPeriod.start} ~ {analysisResult.nextPredictionPeriod.end}</div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 border border-slate-200">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">전체 기준</div>
                    <div className="mt-3 text-base text-slate-900">{analysisResult.fullNextReferencePeriod.start} ~ {analysisResult.fullNextReferencePeriod.end}</div>
                  </div>
                </div>
              </div>

              <KeyMetrics
                currentAverage={formatKrw(analysisResult.currentPeriod.averageKrw)}
                nextAverage={formatKrw(analysisResult.nextPredictionPeriod.averageKrw)}
                routeAdjustedCurrent={formatRouteIndex(analysisResult.routeAdjustedIndex.current)}
                routeAdjustedNext={formatRouteIndex(analysisResult.routeAdjustedIndex.next)}
                changeRate={analysisResult.changeRate === null ? '-' : `${analysisResult.changeRate.toFixed(2)}%`}
                confidence={`${analysisResult.confidenceProgress}% (${analysisResult.confidenceLabel})`}
              />

              {selectedRoute ? (
                <div className="mt-6 rounded-[28px] bg-slate-50 border border-slate-200 p-6">
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-500">선택 노선</div>
                  <div className="mt-3 text-lg font-semibold text-slate-900">{selectedRoute.originName} {selectedRoute.originCode} → {selectedRoute.destinationName} {selectedRoute.destinationCode}</div>
                  <div className="mt-3 text-sm text-slate-700">운항거리: {selectedRoute.distanceMile.toLocaleString()} mile / {selectedRoute.distanceKm.toLocaleString()} km</div>
                  <div className="mt-2 text-sm text-slate-700">거리구간: {selectedRoute.distanceBandLabel}</div>
                  <div className="mt-3 text-xs text-slate-500">거리구간은 실제 항공사별 유류할증료 금액 계산이 아니라, 운항거리 기반 참고 정보입니다.</div>
                </div>
              ) : null}

              <PeriodComparisonTable rows={[
                { label: '현재 발권월 기준 기간', value: `${analysisResult.currentPeriod.start} ~ ${analysisResult.currentPeriod.end}` },
                { label: '다음 발권월 예측 기간', value: `${analysisResult.nextPredictionPeriod.start} ~ ${analysisResult.nextPredictionPeriod.end}` },
                { label: '직전 산정기간 평균 (KRW/bbl)', value: formatKrw(analysisResult.currentPeriod.averageKrw) },
                { label: '현재 진행 중 평균 (KRW/bbl)', value: formatKrw(analysisResult.nextPredictionPeriod.averageKrw) },
                { label: '현재 발권월 데이터 개수', value: `${analysisResult.currentPeriod.dataCount}` },
                { label: '예측 데이터 개수', value: `${analysisResult.nextPredictionPeriod.dataCount}` },
              ]} />

              {/* Monthly averages removed for customer-facing UI */}

              <TrendChart prices={combinedPrices} currentPeriod={analysisResult.currentPeriod} nextPredictionPeriod={analysisResult.nextPredictionPeriod} />

              <section className="rounded-[32px] bg-white shadow-sm border border-slate-200 p-8">
                <h3 className="text-xl font-semibold text-slate-950">어떻게 계산하나요?</h3>
                <p className="mt-4 text-slate-600 leading-7">현재 발권월 기준으로 전전월 16일~전월 15일까지의 Dubai 평균을 기준선으로 삼습니다. 그 다음, 다음 발권월 예측 기간은 전월 16일부터 선택한 발권일까지 계산하되, 다음 발권월 전체 기간 종료일(15일)을 넘기지 않습니다.</p>
                <p className="mt-4 text-slate-600 leading-7">국제선 유류할증료는 단순 국가명이 아니라 운항거리 구간과 관련될 수 있습니다. 그래서 유타는 선택한 목적지의 공항 간 대권거리와 거리구간을 함께 보여줍니다.</p>
                <p className="mt-4 text-slate-600 leading-7">현재 버전에서는 거리구간을 실제 유류할증료 금액 계산에 직접 반영하지 않습니다. 발권 타이밍 추천은 두바이유 추세 기준이며, 실제 유류할증료 금액은 항공사별 고시표와 거리구간에 따라 달라질 수 있습니다.</p>
                <p className="mt-4 text-slate-600 leading-7">이 결과는 Dubai 유가 추세를 참고한 것이며, 실제 항공사 유류할증료 및 공급/수요 상황과는 다를 수 있습니다. 발권 결정 전에는 항공권 운임과 좌석 상황을 함께 확인하세요.</p>
              </section>

              <DataSourceNotice />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
