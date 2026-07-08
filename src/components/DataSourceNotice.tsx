import React from 'react'

export default function DataSourceNotice(){
  return (
    <div className="mt-4 rounded-[28px] bg-slate-50 border border-slate-200 p-6 text-sm leading-6 text-slate-700">
      <div className="font-semibold text-slate-900">데이터 출처</div>
      <ul className="mt-3 list-disc pl-5 space-y-2">
        <li>Dubai crude 공개 가격 데이터를 내장된 일별 가격으로 사용합니다.</li>
        <li>DEXKOUS 환율 데이터를 사용해 USD/bbl을 KRW/bbl로 환산합니다.</li>
        <li>선택한 목적지의 운항거리는 노선별 운항거리 자료를 기반으로 합니다.</li>
        <li>거리구간은 참고 정보이며, 실제 항공사 유류할증료 금액 계산과는 별도입니다.</li>
      </ul>
    </div>
  )
}
