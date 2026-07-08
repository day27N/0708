import React from 'react'

type KeyMetricsProps = {
  currentAverage: string
  currentAverageSub: string
  nextAverage: string
  nextAverageSub: string
  changeRate: string
  distanceImpact: string
  routeAdjustedNext: string
  confidence: string
}

type MetricItem = {
  label: string
  value: string
  sub?: string
}

function MetricCard({ label, value, sub }: MetricItem) {
  return (
    <div className="flex min-h-[136px] min-w-0 flex-col justify-between rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="break-keep text-[0.86rem] font-semibold leading-5 text-slate-500">{label}</div>
      <div className="mt-3 break-keep text-[1.28rem] font-black leading-snug text-slate-950 sm:text-[1.45rem]">
        <span className="whitespace-normal">{value}</span>
      </div>
      {sub ? <div className="mt-2 whitespace-nowrap text-[0.84rem] font-medium text-slate-500">{sub}</div> : null}
    </div>
  )
}

export default function KeyMetrics({
  currentAverage,
  currentAverageSub,
  nextAverage,
  nextAverageSub,
  changeRate,
  distanceImpact,
  routeAdjustedNext,
  confidence,
}: KeyMetricsProps) {
  const metrics: MetricItem[] = [
    {
      label: '직전 산정기간 원화 유류비 지표',
      value: currentAverage,
      sub: currentAverageSub,
    },
    {
      label: '현재 진행기간 원화 유류비 지표',
      value: nextAverage,
      sub: nextAverageSub,
    },
    {
      label: '변화율',
      value: changeRate,
    },
    {
      label: '거리 영향도',
      value: distanceImpact,
    },
    {
      label: '거리반영 원화 유류비 지표',
      value: routeAdjustedNext,
    },
    {
      label: '신뢰도',
      value: confidence,
    },
  ]

  return (
    <section className="mt-6">
      <h2 className="text-xl font-bold text-slate-950">핵심 지표</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(metric => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </section>
  )
}
