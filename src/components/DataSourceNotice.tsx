import React from 'react'

export default function DataSourceNotice() {
  return (
    <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold text-slate-950">데이터 출처 / 주의문구</h2>
      <ul className="mt-4 space-y-2 break-keep">
        <li>Dubai 가격 데이터와 DEXKOUS USD/KRW 환율 데이터를 사용해 원화 환산 유류비 지표를 계산합니다.</li>
        <li>선택한 목적지의 운항거리는 노선별 운항거리 자료를 기반으로 하며, 거리구간은 참고 정보입니다.</li>
        <li>본 결과는 Dubai 가격과 USD/KRW 환율을 활용한 원화 환산 유류비 추세 참고 정보입니다. 실제 유류할증료 금액은 항공사별 기준, 거리구간, 고시 시점 등에 따라 달라질 수 있습니다.</li>
      </ul>
    </section>
  )
}
