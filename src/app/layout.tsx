import React from 'react'
import '../styles/globals.css'

export const metadata = {
  title: '유타 - 발권 타이밍 어드바이저',
  description: '두바이유 추세 기반 발권 타이밍'
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
