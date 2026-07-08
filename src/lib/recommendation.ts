import { Recommendation } from '../types/fuel'

export function getRecommendation(changeRate: number|null) {
  if (changeRate === null || isNaN(changeRate)) return 'INSUFFICIENT_DATA' as Recommendation
  if (changeRate >= 7) return 'BUY_NOW' as Recommendation
  if (changeRate <= -7) return 'WAIT' as Recommendation
  return 'NEUTRAL' as Recommendation
}

export function recommendationText(changeRate: number|null) {
  const rec = getRecommendation(changeRate)
  if (rec === 'BUY_NOW') return {
    title: '원화 환산 유류비 기준, 지금 발권이 유리할 수 있어요',
    desc: '현재 진행 중인 원화 환산 Dubai 평균이 직전 산정기간보다 높습니다. 선택한 노선의 운항거리를 고려하면 유류비 변화 영향이 더 크게 느껴질 수 있어요.'
  }
  if (rec === 'WAIT') return {
    title: '원화 환산 유류비 기준, 조금 기다리는 전략도 가능해요',
    desc: '현재 진행 중인 원화 환산 Dubai 평균이 직전 산정기간보다 낮습니다. 선택한 노선의 운항거리를 고려하면 다음 달 유류비 부담이 낮아질 가능성을 참고할 수 있어요.'
  }
  if (rec === 'NEUTRAL') return {
    title: '원화 환산 유류비만 보면 큰 차이는 없어 보여요',
    desc: '현재 진행 중인 원화 환산 Dubai 평균과 직전 산정기간 평균의 차이가 크지 않습니다. 항공권 기본 운임과 좌석 재고도 함께 확인하는 것이 좋아요.'
  }
  return {
    title: '계산에 필요한 데이터가 부족해요',
    desc: '선택한 발권일 기준으로 계산에 필요한 두바이유 또는 환율 데이터가 충분하지 않습니다.'
  }
}
