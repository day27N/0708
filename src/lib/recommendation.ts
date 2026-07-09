import { Recommendation } from '../types/fuel'
import { SIGNIFICANT_IMPACT_KRW, YUTA_DIRECTION_THRESHOLD_RATE } from './constants'

export function getRecommendation(
  deltaKrwPerBarrel: number | null,
  estimatedRouteImpactKrw: number | null,
  changeRate: number | null,
): Recommendation {
  if (
    deltaKrwPerBarrel === null ||
    estimatedRouteImpactKrw === null ||
    changeRate === null ||
    isNaN(deltaKrwPerBarrel) ||
    isNaN(estimatedRouteImpactKrw) ||
    isNaN(changeRate)
  ) {
    return 'INSUFFICIENT_DATA'
  }

  if (Math.abs(changeRate) < YUTA_DIRECTION_THRESHOLD_RATE) return 'NEUTRAL'
  if (estimatedRouteImpactKrw >= SIGNIFICANT_IMPACT_KRW && deltaKrwPerBarrel > 0) return 'BUY_NOW'
  if (estimatedRouteImpactKrw >= SIGNIFICANT_IMPACT_KRW && deltaKrwPerBarrel < 0) return 'WAIT'
  return 'WEAK_SIGNAL'
}

export function recommendationText(rec: Recommendation, deltaKrwPerBarrel: number | null = null) {
  if (rec === 'BUY_NOW') return {
    title: '유류할증료가 오를 가능성이 커요',
    desc: '현재 원화 환산 Dubai 지표가 직전 산정기간보다 높고, 선택 노선 편도 기준 참고 영향액이 2.5만 원 이상입니다. 유류비 관점에서는 지금 발권이 유리할 수 있어요.'
  }
  if (rec === 'WAIT') return {
    title: '유류할증료가 내려갈 가능성이 커요',
    desc: '현재 원화 환산 Dubai 지표가 직전 산정기간보다 낮고, 선택 노선 편도 기준 참고 영향액이 2.5만 원 이상입니다. 일정이 급하지 않다면 조금 기다려볼 만해요.'
  }
  if (rec === 'WEAK_SIGNAL' && deltaKrwPerBarrel !== null && deltaKrwPerBarrel > 0) return {
    title: '조금 오를 가능성이 있어요',
    desc: '원화 환산 Dubai 지표는 오르는 방향이지만, 선택 노선 편도 기준 참고 영향액은 2.5만 원보다 작습니다. 유류비만으로 결정하기보다는 항공권 기본 운임과 좌석 재고를 함께 확인해 보세요.'
  }
  if (rec === 'WEAK_SIGNAL') return {
    title: '조금 내려갈 가능성이 있어요',
    desc: '원화 환산 Dubai 지표는 내려가는 방향이지만, 선택 노선 편도 기준 참고 영향액은 2.5만 원보다 작습니다. 급한 일정이 아니라면 조금 더 지켜볼 수 있어요.'
  }
  if (rec === 'NEUTRAL') return {
    title: '뚜렷한 방향성이 약해요',
    desc: '원화 환산 Dubai 지표의 변화가 크지 않아, 유류비 관점에서는 발권 시점에 따른 차이가 뚜렷하지 않습니다.'
  }
  return {
    title: '계산에 필요한 데이터가 부족해요',
    desc: '선택한 발권일 기준으로 계산에 필요한 두바이유 또는 환율 데이터가 충분하지 않습니다.'
  }
}
