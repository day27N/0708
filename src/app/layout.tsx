import React from 'react'

export const metadata = {
  title: '유타로 - 발권 타이밍 어드바이저',
  description: '두바이유 기준 발권 타이밍 참고 도구'
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="ko">
      <head />
      <body>
        {children}
      </body>
    </html>
  )
}
