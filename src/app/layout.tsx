import React from 'react'
import Script from 'next/script'
import '../styles/globals.css'
import { GA_MEASUREMENT_ID } from '../lib/analytics'

export const metadata = {
  title: '유타 - 발권 타이밍 어드바이저',
  description: '두바이유 추세 기반 발권 타이밍'
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="ko">
      <head>
        <meta name="google-site-verification" content="fZx-dAfAG5OAZusdLpTYWrl5BvOERZpPoKmjzxEgG2U" />
      </head>
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}
