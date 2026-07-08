import React from 'react'

export default function DataSourceNotice() {
  return (
    <section className="mt-6 rounded-[26px] border border-slate-200 bg-[#FBFDFF] p-6 text-sm leading-7 text-slate-600 shadow-sm sm:p-7">
      <h2 className="text-lg font-bold text-slate-950">데이터 출처</h2>
      <ul className="mt-4 space-y-3 break-keep">
        <li>Dubai 가격 데이터와 DEXKOUS USD/KRW 환율 데이터를 사용해 원화 환산 유류비 지표를 계산합니다.</li>
        <li>선택한 목적지의 운항거리는 노선별 운항거리 자료를 기반으로 하며, 거리구간은 참고 정보입니다.</li>
        <li>환율 데이터가 없는 날짜는 직전 유효 USD/KRW 환율을 사용합니다.</li>
        <li>거리반영 참고 영향액은 실제 유류할증료 금액이 아니라, 원화 환산 Dubai 가격 변화와 노선 운항거리를 결합한 편도 기준 참고 지표입니다.</li>
      </ul>
    </section>
  )
}
