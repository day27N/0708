import { RouteDistance } from '../types/fuel'

export type DistanceImpact = {
  level: '낮음' | '보통' | '높음' | '매우 높음'
  label: string
  weight: number
  routeImpactScore: number | null
  routeImpactLabel: '낮음' | '보통' | '높음' | '매우 높음' | null
}

export function getDistanceImpactLevel(distanceMile: number): Omit<DistanceImpact, 'routeImpactScore' | 'routeImpactLabel'> {
  if (distanceMile < 1000) return { level: '낮음', label: '단거리', weight: 1 }
  if (distanceMile < 3000) return { level: '보통', label: '중거리', weight: 1.5 }
  if (distanceMile < 5000) return { level: '높음', label: '중장거리', weight: 2 }
  return { level: '매우 높음', label: '장거리', weight: 2.5 }
}

export function getRouteImpactLabel(routeImpactScore: number): DistanceImpact['routeImpactLabel'] {
  if (routeImpactScore < 7) return '낮음'
  if (routeImpactScore < 14) return '보통'
  if (routeImpactScore < 22) return '높음'
  return '매우 높음'
}

export function buildDistanceImpact(route: RouteDistance | null, changeRate: number | null): DistanceImpact {
  if (!route || changeRate === null || isNaN(changeRate)) {
    return {
      level: '낮음',
      label: '단거리',
      weight: 1,
      routeImpactScore: null,
      routeImpactLabel: null,
    }
  }
  const base = getDistanceImpactLevel(route.distanceMile)
  const score = Math.abs(changeRate) * base.weight
  return {
    ...base,
    routeImpactScore: Math.round(score * 100) / 100,
    routeImpactLabel: getRouteImpactLabel(score),
  }
}

export function calculateRouteAdjustedIndex(averageKrw: number | null, distanceMile: number): number | null {
  if (averageKrw === null || isNaN(averageKrw)) return null
  return Math.round(averageKrw * (distanceMile / 1000))
}

export function formatRouteAdjustedIndex(value: number | null) {
  return value === null ? '-' : `${value.toLocaleString()}원/bbl·천마일`
}
