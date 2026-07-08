import React from 'react'

export default function DataSourceNotice(){
  return (
    <div className="mt-4 p-3 text-xs text-slate-700 bg-slate-50 rounded">
      <strong>데이터 출처:</strong> 오피넷/한국석유공사 국제유가 중 Dubai 가격을 사용한 proxy 지표입니다. 실제 항공사 유류할증료와는 차이가 있을 수 있습니다.
    </div>
  )
}
