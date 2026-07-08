import React from 'react'

export default function Hero(){
  return (
    <header className="py-6">
      <div className="mx-auto max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white text-sm font-semibold" style={{background: 'var(--color-primary)'}}>유타</div>
        <h1 className="mt-4 text-center text-4xl sm:text-5xl font-bold tracking-tight text-slate-950">이 날짜에 발권한다면?</h1>
        <div className="mt-4 mx-auto max-w-3xl space-y-2 text-slate-600 leading-relaxed" style={{wordBreak: 'keep-all'}}>
          <p>두바이유 추세를 기준으로 다음 달 유류할증료 방향성을 참고해요.</p>
          <p>출발일이 아니라 발권일 기준으로 계산됩니다.</p>
        </div>
      </div>
    </header>
  )
}
