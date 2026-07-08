import { Recommendation } from '../types/fuel'

export function getRecommendation(changeRate: number|null) {
  if (changeRate === null || isNaN(changeRate)) return 'NEUTRAL' as Recommendation
  if (changeRate >= 5) return 'BUY_NOW' as Recommendation
  if (changeRate <= -5) return 'WAIT' as Recommendation
  return 'NEUTRAL' as Recommendation
}

export function recommendationText(changeRate: number|null) {
  const rec = getRecommendation(changeRate)
  if (rec === 'BUY_NOW') return {
    title: '유류비 추세 기준, 지금 발권이 유리할 수 있어요',
    desc: '현재 진행 중인 두바이유 평균이 직전 산정기간보다 높습니다. 다음 달 유류할증료가 오를 가능성이 있어, 유류비 관점에서는 지금 발권이 유리할 수 있습니다.'
  }
  if (rec === 'WAIT') return {
    title: '유류비 추세 기준, 조금 기다리는 전략도 가능해요',
    desc: '현재 진행 중인 두바이유 평균이 직전 산정기간보다 낮습니다. 다음 달 유류할증료가 내려갈 가능성이 있어, 일정이 급하지 않다면 기다리는 전략도 고려할 수 있습니다.'
  }
  return {
    title: '유류비 추세만 보면 큰 차이는 없어 보여요',
    desc: '현재 진행 중인 두바이유 평균과 직전 산정기간 평균의 차이가 크지 않습니다. 유류할증료보다는 항공권 기본 운임, 좌석 재고, 프로모션을 함께 확인하는 것이 좋습니다.'
  }
}
