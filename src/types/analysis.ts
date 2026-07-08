import { ReferencePeriod, RouteDistance } from './fuel'

export type AnalysisResult = {
  status: 'BUY_NOW' | 'WAIT' | 'WEAK_SIGNAL' | 'NEUTRAL' | 'INSUFFICIENT_DATA'
  title: string
  description: string
  selectedTicketingDate: string
  currentIssueMonth: string
  nextIssueMonth: string
  dubaiDataAvailableUntil: string
  fxDataAvailableUntil: string
  effectiveDataUntil: string
  currentPeriod: {
    startDate: string
    endDate: string
    averageUsd: number | null
    averageKrw: number | null
    dataCount: number
  }
  nextPredictionPeriod: {
    startDate: string
    endDate: string
    averageUsd: number | null
    averageKrw: number | null
    dataCount: number
  }
  changeRate: number | null
  impactAmount: {
    deltaKrwPerBarrel: number | null
    absDeltaKrwPerBarrel: number | null
    estimatedRouteImpactKrw: number | null
    significantThresholdKrw: number
    weakThresholdKrw: number
    impactLevel: '낮음' | '보통' | '유의미' | null
    isSignificant: boolean
  }
  selectedRoute: RouteDistance | null
  distanceImpact: {
    level: '낮음' | '보통' | '높음' | '매우 높음'
    label: string
    weight: number
    routeImpactScore: number | null
    routeImpactLabel: '낮음' | '보통' | '높음' | '매우 높음' | null
  }
  routeAdjustedIndex: {
    current: number | null
    next: number | null
    unit: '원/bbl·천마일'
  }
  confidenceProgress: number
  confidenceLabel: '낮음' | '보통' | '높음'
  warnings: string[]
}
