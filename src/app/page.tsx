"use client"
import React, { useState, useMemo } from 'react'
import Hero from '../components/Hero'
import CsvUploader from '../components/CsvUploader'
import RouteInputForm from '../components/RouteInputForm'
import FuelTimingCard from '../components/FuelTimingCard'
import TrendChart from '../components/TrendChart'
import PeriodComparisonTable from '../components/PeriodComparisonTable'
import DataSourceNotice from '../components/DataSourceNotice'
import { DailyDubaiOilPrice } from '../types/fuel'
import { getIssueMonth, getNextIssueMonth, getCurrentReferencePeriod, getNextPredictionPeriod, getFullNextReferencePeriod } from '../lib/dateUtils'
import { calculateAverage, calculateChangeRate, calculateConfidenceProgress } from '../lib/fuelCalculator'
import { recommendationText } from '../lib/recommendation'

export default function Page(){
  const [prices, setPrices] = useState<DailyDubaiOilPrice[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [from, setFrom] = useState('ICN')
  const [to, setTo] = useState('NRT')
  const todayStr = new Date().toISOString().slice(0,10)
  const [departureDate, setDepartureDate] = useState(todayStr)
  const [ticketingDate, setTicketingDate] = useState(todayStr)

  const onLoad = (data:DailyDubaiOilPrice[], meta:any) => {
    setPrices(data)
    setMeta(meta)
  }

  const availableUntil = prices.length ? prices[prices.length-1].date : todayStr

  const analysis = useMemo(()=>{
    if (prices.length===0) return null
    const ticketDate = new Date(ticketingDate)
    const issueMonth = getIssueMonth(ticketDate)
    const nextMonth = getNextIssueMonth(ticketDate)
    const currentPeriod = getCurrentReferencePeriod(issueMonth)
    const nextPartial = getNextPredictionPeriod(ticketDate, new Date(availableUntil))
    const fullNext = getFullNextReferencePeriod(ticketDate)
    const cur = calculateAverage(prices, currentPeriod.start, currentPeriod.end)
    const next = calculateAverage(prices, nextPartial.start, nextPartial.end)
    const changeRate = calculateChangeRate(cur.average, next.average)
    const confidence = calculateConfidenceProgress(ticketingDate, fullNext, availableUntil)
    const recText = recommendationText(changeRate===null? NaN : changeRate >=7 ? 7 : changeRate <= -7 ? -7 : changeRate) // simple
    return { issueMonth, nextMonth, currentPeriod, nextPartial, fullNext, cur, next, changeRate, confidence, recText }
  },[prices, ticketingDate, availableUntil])

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <Hero />
      <section className="mt-4">
        <CsvUploader onLoad={onLoad} />
        {meta && <div className="mt-2 text-sm">데이터: {meta.firstDate} ~ {meta.lastDate} ({meta.count}건)</div>}
      </section>

      <section className="mt-6">
        <RouteInputForm from={from} to={to} month={departureDate.slice(0,7)} onChange={({from,to,month})=>{setFrom(from);setTo(to);setDepartureDate(month+ '-01')}} onAnalyze={()=>{}} />
      </section>

      <section className="mt-6 grid gap-4">
        <div className="flex gap-3">
          <div>
            <label className="block text-sm">선택한 출발일</label>
            <input type="date" value={departureDate} onChange={e=>setDepartureDate(e.target.value)} className="p-2 border rounded mt-1" />
          </div>
          <div>
            <label className="block text-sm">이 날짜에 발권한다면?</label>
            <input type="date" value={ticketingDate} onChange={e=>setTicketingDate(e.target.value)} className="p-2 border rounded mt-1" />
          </div>
        </div>

        {analysis ? (
          <>
            <FuelTimingCard rec={analysis.changeRate===null? 'NEUTRAL' : analysis.changeRate>=7? 'BUY_NOW' : analysis.changeRate<=-7?'WAIT':'NEUTRAL'} title={analysis.recText.title} desc={analysis.recText.desc} changeRate={analysis.changeRate} confidence={{progress: analysis.confidence.progress, level: analysis.confidence.label}} />

            <PeriodComparisonTable rows={[
              {label: '현재 발권월 기준', value: `${analysis.currentPeriod.start} ~ ${analysis.currentPeriod.end}`},
              {label: '다음 발권월 예측(부분)', value: `${analysis.nextPartial.start} ~ ${analysis.nextPartial.end}`},
              {label: '직전 평균 (USD/bbl)', value: analysis.cur.average ? analysis.cur.average.toFixed(2) : '-'},
              {label: '현재 평균 (USD/bbl)', value: analysis.next.average ? analysis.next.average.toFixed(2) : '-'},
              {label: '변화율', value: analysis.changeRate===null? '-' : analysis.changeRate.toFixed(2) + '%'},
            ]} />

            <TrendChart prices={prices} />

            <DataSourceNotice />
          </>
        ) : (
          <div className="mt-4 text-sm text-slate-600">CSV를 업로드하면 계산 결과가 표시됩니다.</div>
        )}

      </section>
    </main>
  )
}
