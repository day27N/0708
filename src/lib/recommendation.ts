import { Recommendation } from '../types/fuel'
import { SIGNIFICANT_IMPACT_KRW, WEAK_IMPACT_KRW } from './constants'

export function getRecommendation(deltaKrwPerBarrel: number | null, estimatedRouteImpactKrw: number | null): Recommendation {
  if (
    deltaKrwPerBarrel === null ||
    estimatedRouteImpactKrw === null ||
    isNaN(deltaKrwPerBarrel) ||
    isNaN(estimatedRouteImpactKrw)
  ) {
    return 'INSUFFICIENT_DATA'
  }

  if (estimatedRouteImpactKrw >= SIGNIFICANT_IMPACT_KRW && deltaKrwPerBarrel > 0) return 'BUY_NOW'
  if (estimatedRouteImpactKrw >= SIGNIFICANT_IMPACT_KRW && deltaKrwPerBarrel < 0) return 'WAIT'
  if (estimatedRouteImpactKrw >= WEAK_IMPACT_KRW) return 'WEAK_SIGNAL'
  return 'NEUTRAL'
}

export function recommendationText(rec: Recommendation) {
  if (rec === 'BUY_NOW') return {
    title: '거리반영 참고액 기준, 지금 발권이 유리할 수 있어요',
    desc: '현재 진행 중인 원화 환산 Dubai 지표가 직전 산정기간보다 높고, 선택 노선 편도 기준 참고 영향액이 5만 원 이상입니다. 유류비 관점에서는 지금 발권이 유리할 수 있어요.'
  }
  if (rec === 'WAIT') return {
    title: '거리반영 참고액 기준, 기다리는 전략도 가능해요',
    desc: '현재 진행 중인 원화 환산 Dubai 지표가 직전 산정기간보다 낮아 비용이 내려가는 추세이고, 선택 노선 편도 기준 참고 영향액이 5만 원 이상입니다. 일정이 급하지 않다면 기다리는 전략도 고려할 수 있어요.'
  }
  if (rec === 'WEAK_SIGNAL') return {
    title: '방향성은 보이지만, 차이는 크지 않아요',
    desc: '원화 환산 Dubai 지표는 움직이고 있지만, 선택 노선 편도 기준 참고 영향액이 5만 원에는 미치지 않습니다. 유류비만으로 발권 시점을 결정하기보다는 항공권 기본 운임과 좌석 재고를 함께 확인하는 것이 좋아요.'
  }
  if (rec === 'NEUTRAL') return {
    title: '유류비 관점에서는 차이가 크지 않아요',
    desc: '선택 노선 편도 기준 참고 영향액이 작아, 유류비 관점에서는 발권 시점에 따른 차이가 크지 않아 보입니다.'
  }
  return {
    title: '계산에 필요한 데이터가 부족해요',
    desc: '선택한 발권일 기준으로 계산에 필요한 두바이유 또는 환율 데이터가 충분하지 않습니다.'
  }
}
