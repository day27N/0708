"use client"
import React, { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import FuelTimingCard from '../components/FuelTimingCard'
import TrendChart from '../components/TrendChart'
import PeriodComparisonTable from '../components/PeriodComparisonTable'
import DataSourceNotice from '../components/DataSourceNotice'
import KeyMetrics from '../components/KeyMetrics'
import { DailyDubaiOilPrice, AnalysisResult } from '../types/fuel'
import { getIssueMonth, getNextIssueMonth, getCurrentReferencePeriod, getNextPredictionPeriod, getFullNextReferencePeriod } from '../lib/dateUtils'
import { calculateAverage, calculateChangeRate, calculateConfidenceProgress, aggregateMonthly } from '../lib/fuelCalculator'
import { recommendationText, getRecommendation } from '../lib/recommendation'
import { loadInternalDubaiCsv } from '../data/internalDubaiCsv'

export default function Page(){
  const todayStr = new Date().toISOString().slice(0,10)
  const [prices, setPrices] = useState<DailyDubaiOilPrice[]>([])
  const [selectedTicketingDate, setSelectedTicketingDate] = useState<string>(todayStr)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const analyzeTicketingDate = (date: string, loadedPrices: DailyDubaiOilPrice[]): AnalysisResult => {
    const ticketDate = new Date(date)
    const issueMonth = getIssueMonth(ticketDate)
    const nextIssueMonth = getNextIssueMonth(ticketDate)
    const currentPeriod = getCurrentReferencePeriod(issueMonth)
    const nextPredictionPeriod = getNextPredictionPeriod(ticketDate, new Date(loadedPrices[loadedPrices.length - 1].date))
    const fullNextReferencePeriod = getFullNextReferencePeriod(ticketDate)
    const currentCalc = calculateAverage(loadedPrices, currentPeriod.start, currentPeriod.end)
    const nextCalc = calculateAverage(loadedPrices, nextPredictionPeriod.start, nextPredictionPeriod.end)
    const changeRate = calculateChangeRate(currentCalc.average, nextCalc.average)
    const confidence = calculateConfidenceProgress(date, fullNextReferencePeriod, loadedPrices[loadedPrices.length - 1].date)
    const recommendation = getRecommendation(changeRate)
    const recommendationTextValue = recommendationText(changeRate)
    const monthly = aggregateMonthly(loadedPrices)

    return {
      selectedTicketingDate: date,
      issueMonth,
      nextIssueMonth,
      availableUntil: loadedPrices[loadedPrices.length - 1].date,
      currentPeriod,
      nextPredictionPeriod,
      fullNextReferencePeriod,
      currentAverage: currentCalc.average,
      currentCount: currentCalc.count,
      nextAverage: nextCalc.average,
      nextCount: nextCalc.count,
      changeRate,
      confidence,
      recommendation,
      recommendationText: recommendationTextValue,
      nowPrice: currentCalc.average,
      laterPrice: nextCalc.average,
      monthlyAverages: monthly,
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true)
        const loadedPrices = await loadInternalDubaiCsv()
        setPrices(loadedPrices)
        const initialResult = analyzeTicketingDate(selectedTicketingDate, loadedPrices)
        setAnalysisResult(initialResult)
      } catch (e) {
        setError('두바이유 데이터를 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const handleTicketingDateChange = (date: string) => {
    setSelectedTicketingDate(date)
    if (prices.length > 0) {
      const result = analyzeTicketingDate(date, prices)
      console.log('selectedTicketingDate:', date)
      console.log('analysis result:', result)
      setAnalysisResult(result)
    }
  }

  const handleAnalyzeClick = () => {
    if (prices.length === 0) {
      setError('두바이유 데이터가 아직 준비되지 않았습니다.')
      return
    }
    const result = analyzeTicketingDate(selectedTicketingDate, prices)
    console.log('handleAnalyzeClick selectedTicketingDate:', selectedTicketingDate)
    console.log('analysis result:', result)
    setAnalysisResult(result)
  }

  const renderStatusColor = analysisResult?.recommendation === 'BUY_NOW' ? 'from-orange-200 via-orange-100 to-orange-50 border-orange-300' : analysisResult?.recommendation === 'WAIT' ? 'from-emerald-200 via-emerald-100 to-emerald-50 border-emerald-300' : 'from-slate-200 via-slate-100 to-yellow-50 border-slate-300'

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white text-sm font-semibold">유타</div>
            <p className="mt-3 text-slate-600">두바이유 추세 기반 발권 타이밍</p>
          </div>
        </header>

        <section className="rounded-[32px] bg-white shadow-lg border border-slate-200 p-8 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-950">이 날짜에 발권한다면?</h1>
            <p className="mt-4 text-slate-600 text-lg leading-8">두바이유 추세를 기준으로 다음 달 유류할증료 방향성을 참고해요. 출발일이 아니라 발권일 기준으로 계산됩니다.</p>
          </div>
        </section>

        <section className="grid gap-6">
          <div className="rounded-[28px] bg-white shadow-sm border border-slate-200 p-6">
            <div className="text-sm text-slate-500 font-medium mb-2">이 날짜에 발권한다면?</div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1">
                <input type="date" className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-base" value={selectedTicketingDate} onChange={e => handleTicketingDateChange(e.target.value)} />
              </div>
              <button className="px-6 py-3 rounded-3xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition" onClick={handleAnalyzeClick}>발권 타이밍 보기</button>
            </div>
            <div className="mt-3 text-sm text-slate-500">선택한 날짜: {selectedTicketingDate}</div>
          </div>

          {error && <div className="rounded-3xl bg-rose-50 border border-rose-200 text-rose-700 p-4">{error}</div>}

          {isLoading || !analysisResult ? (
            <div className="rounded-[32px] bg-white shadow-sm border border-slate-200 p-8 text-center text-slate-500">데이터를 불러오는 중입니다...</div>
          ) : (
            <>
              <div className={`rounded-[32px] border ${renderStatusColor} p-8 shadow-sm`}> 
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                  <div>
                    <div className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">{analysisResult.recommendation === 'BUY_NOW' ? '지금 발권 유리' : analysisResult.recommendation === 'WAIT' ? '기다리기 고려' : '중립'}</div>
                    <h2 className="mt-5 text-3xl sm:text-4xl font-bold text-slate-950">{analysisResult.recommendationText.title}</h2>
                    <p className="mt-4 text-slate-700 text-base max-w-2xl">{analysisResult.recommendationText.desc}</p>
                  </div>
                  <div className="rounded-3xl bg-white/90 border border-slate-200 p-6 text-center min-w-[180px]">
                    <div className="text-sm text-slate-500">변화율</div>
                    <div className="mt-3 text-4xl font-bold text-slate-950">{analysisResult.changeRate === null ? '-' : `${analysisResult.changeRate.toFixed(2)}%`}</div>
                    <div className="mt-3 text-sm text-slate-500">신뢰도 {analysisResult.confidence.progress}% ({analysisResult.confidence.label})</div>
                    <div className="mt-2 text-xs text-slate-500">데이터 기준일: {analysisResult.availableUntil}</div>
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
                currentAverage={analysisResult.currentAverage === null ? '-' : analysisResult.currentAverage.toFixed(2)}
                nextAverage={analysisResult.nextAverage === null ? '-' : analysisResult.nextAverage.toFixed(2)}
                nowPrice={analysisResult.nowPrice === null ? '-' : analysisResult.nowPrice?.toFixed(2)}
                laterPrice={analysisResult.laterPrice === null ? '-' : analysisResult.laterPrice?.toFixed(2)}
                changeRate={analysisResult.changeRate === null ? '-' : `${analysisResult.changeRate.toFixed(2)}%`}
                confidence={`${analysisResult.confidence.progress}% (${analysisResult.confidence.label})`}
              />

              <PeriodComparisonTable rows={[
                { label: '현재 발권월 기준 기간', value: `${analysisResult.currentPeriod.start} ~ ${analysisResult.currentPeriod.end}` },
                { label: '다음 발권월 예측 기간', value: `${analysisResult.nextPredictionPeriod.start} ~ ${analysisResult.nextPredictionPeriod.end}` },
                { label: '직전 산정기간 평균', value: analysisResult.currentAverage === null ? '-' : analysisResult.currentAverage.toFixed(2) },
                { label: '현재 진행 중 평균', value: analysisResult.nextAverage === null ? '-' : analysisResult.nextAverage.toFixed(2) },
                { label: '데이터 개수', value: `${analysisResult.nextCount}` },
              ]} />

              <section className="mt-6 rounded-3xl bg-white p-4 border border-slate-200">
                <h4 className="font-semibold text-lg mb-2">월별 평균 (월 - 평균 - 데이터 수)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500"><th className="px-2 py-1">월</th><th className="px-2 py-1">평균</th><th className="px-2 py-1">데이터 수</th></tr>
                    </thead>
                    <tbody>
                      {analysisResult.monthlyAverages?.map(m => (
                        <tr key={m.month} className="border-t"><td className="px-2 py-1">{m.month}</td><td className="px-2 py-1 text-right">{m.average === null ? '-' : m.average.toFixed(2)}</td><td className="px-2 py-1 text-right">{m.count}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <TrendChart prices={prices} currentPeriod={analysisResult.currentPeriod} nextPredictionPeriod={analysisResult.nextPredictionPeriod} />

              <section className="rounded-[32px] bg-white shadow-sm border border-slate-200 p-8">
                <h3 className="text-xl font-semibold text-slate-950">어떻게 계산하나요?</h3>
                <p className="mt-4 text-slate-600 leading-7">현재 발권월 기준으로 전전월 16일~전월 15일까지의 Dubai 평균을 기준선으로 삼습니다. 그 다음, 다음 발권월 예측 기간은 전월 16일부터 선택한 발권일까지 계산하되, 다음 발권월 전체 기간 종료일(15일)을 넘기지 않습니다.</p>
                <p className="mt-4 text-slate-600 leading-7">이 결과는 Dubai 유가 추세를 참고한 것이며, 실제 항공사 유류할증료 및 공급/수요 상황과는 다를 수 있습니다. 발권 결정 전에는 항공권 운임과 좌석 상황을 함께 확인하세요.</p>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
