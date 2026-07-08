import { DailyDubaiKrwPoint } from '../types/fx'
import { ReferencePeriod, RouteDistance, AnalysisResult } from '../types/fuel'
import { calculateAverage, calculateChangeRate, calculateConfidenceProgress } from './fuelCalculator'
import { getRecommendation, recommendationText } from './recommendation'
import { buildDistanceImpact, calculateRouteAdjustedIndex } from './routeImpact'
import { SIGNIFICANT_IMPACT_KRW, WEAK_IMPACT_KRW } from './constants'

function filterRange(points: DailyDubaiKrwPoint[], start: string, end: string) {
  return points.filter(point => point.date >= start && point.date <= end)
}

export function analyzeKrwFuelData(
  ticketingDate: string,
  dubaiKrwPoints: DailyDubaiKrwPoint[],
  fxRatesAvailableUntil: string,
  selectedRoute: RouteDistance | null,
  currentPeriod: ReferencePeriod,
  nextPredictionPeriod: ReferencePeriod,
  fullNextReferencePeriod: ReferencePeriod,
  dubaiDataAvailableUntil: string,
): AnalysisResult {
  const currentPoints = filterRange(dubaiKrwPoints, currentPeriod.start, currentPeriod.end)
  const nextPoints = filterRange(dubaiKrwPoints, nextPredictionPeriod.start, nextPredictionPeriod.end)

  const currentAvgUsd = currentPoints.length ? currentPoints.reduce((sum, point) => sum + point.dubaiUsdPerBarrel, 0) / currentPoints.length : null
  const currentAvgKrw = currentPoints.length ? currentPoints.reduce((sum, point) => sum + point.dubaiKrwPerBarrel, 0) / currentPoints.length : null
  const nextAvgUsd = nextPoints.length ? nextPoints.reduce((sum, point) => sum + point.dubaiUsdPerBarrel, 0) / nextPoints.length : null
  const nextAvgKrw = nextPoints.length ? nextPoints.reduce((sum, point) => sum + point.dubaiKrwPerBarrel, 0) / nextPoints.length : null

  const changeRate = calculateChangeRate(currentAvgKrw, nextAvgKrw)
  const deltaKrwPerBarrel = currentAvgKrw !== null && nextAvgKrw !== null ? nextAvgKrw - currentAvgKrw : null
  const absDeltaKrwPerBarrel = deltaKrwPerBarrel !== null ? Math.abs(deltaKrwPerBarrel) : null
  const estimatedRouteImpactKrw = absDeltaKrwPerBarrel !== null && selectedRoute
    ? absDeltaKrwPerBarrel * (selectedRoute.distanceMile / 1000)
    : null
  const impactLevel = estimatedRouteImpactKrw === null
    ? null
    : estimatedRouteImpactKrw >= SIGNIFICANT_IMPACT_KRW
      ? '유의미'
      : estimatedRouteImpactKrw >= WEAK_IMPACT_KRW
        ? '보통'
        : '낮음'
  const recommendation = getRecommendation(deltaKrwPerBarrel, estimatedRouteImpactKrw)
  const recommendationTextValue = recommendationText(recommendation)
  const routeImpact = buildDistanceImpact(selectedRoute, changeRate)
  const currentRouteAdjusted = calculateRouteAdjustedIndex(currentAvgKrw, selectedRoute?.distanceMile ?? 0)
  const nextRouteAdjusted = calculateRouteAdjustedIndex(nextAvgKrw, selectedRoute?.distanceMile ?? 0)

  const effectiveDataUntil = [dubaiDataAvailableUntil, fxRatesAvailableUntil].sort().reverse()[0]
  const availableUntil = effectiveDataUntil

  return {
    status: recommendation,
    title: recommendationTextValue.title,
    description: recommendationTextValue.desc,
    selectedTicketingDate: ticketingDate,
    currentIssueMonth: currentPeriod.start.slice(0,7),
    nextIssueMonth: nextPredictionPeriod.end.slice(0,7),
    dubaiDataAvailableUntil,
    fxDataAvailableUntil: fxRatesAvailableUntil,
    effectiveDataUntil,
    currentPeriod: {
      startDate: currentPeriod.start,
      endDate: currentPeriod.end,
      start: currentPeriod.start,
      end: currentPeriod.end,
      averageUsd: currentAvgUsd,
      averageKrw: currentAvgKrw,
      dataCount: currentPoints.length,
    },
    nextPredictionPeriod: {
      startDate: nextPredictionPeriod.start,
      endDate: nextPredictionPeriod.end,
      start: nextPredictionPeriod.start,
      end: nextPredictionPeriod.end,
      averageUsd: nextAvgUsd,
      averageKrw: nextAvgKrw,
      dataCount: nextPoints.length,
    },
    fullNextReferencePeriod,
    changeRate,
    impactAmount: {
      deltaKrwPerBarrel,
      absDeltaKrwPerBarrel,
      estimatedRouteImpactKrw,
      significantThresholdKrw: SIGNIFICANT_IMPACT_KRW,
      weakThresholdKrw: WEAK_IMPACT_KRW,
      impactLevel,
      isSignificant: estimatedRouteImpactKrw !== null && estimatedRouteImpactKrw >= SIGNIFICANT_IMPACT_KRW,
    },
    selectedRoute,
    distanceImpact: routeImpact,
    routeAdjustedIndex: {
      current: currentRouteAdjusted,
      next: nextRouteAdjusted,
      unit: '원/bbl·천마일',
    },
    confidenceProgress: calculateConfidenceProgress(ticketingDate, fullNextReferencePeriod, availableUntil).progress,
    confidenceLabel: calculateConfidenceProgress(ticketingDate, fullNextReferencePeriod, availableUntil).label as '낮음' | '보통' | '높음',
    warnings: [],
  }
}
