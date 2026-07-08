import React from 'react'

export default function Hero(){
  return (
    <header className="py-6 text-center">
      <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white text-sm font-semibold" style={{background: 'var(--color-primary)'}}>유타</div>
      <h1 className="mt-4 display-lg" style={{color:'var(--color-ink)'}}>이 날짜에 발권한다면?</h1>
      <p className="mt-3 body-lg" style={{color:'#333'}}>두바이유 추세를 기준으로 다음 달 유류할증료 방향성을 참고해요.</p>
    </header>
  )
}
