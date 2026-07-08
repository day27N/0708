export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-DWNR2LMQ03'

type GtagEventParams = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      params?: GtagEventParams,
    ) => void
  }
}

export function trackEvent(eventName: string, params?: GtagEventParams) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', eventName, params)
}

export function trackTaskCompletion(params: {
  country: string
  destinationCode: string
  destinationName: string
  ticketingDate: string
  resultStatus: string
  inputMethod: 'manual' | 'sample'
}) {
  trackEvent('task_completion', {
    event_category: 'core_kpi',
    country: params.country,
    destination_code: params.destinationCode,
    destination_name: params.destinationName,
    ticketing_date: params.ticketingDate,
    result_status: params.resultStatus,
    input_method: params.inputMethod,
  })
}

export function trackBookingCtaClick(siteName: string) {
  trackEvent('cta_click', {
    event_category: 'booking_cta',
    event_label: siteName,
    booking_site: siteName,
  })
}
