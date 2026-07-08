export type DailyDubaiOilPrice = {
  date: string; // YYYY-MM-DD
  value: number;
  unit: "USD/bbl";
  source: "OpinetCSV" | "DubaiCrudeMock" | "DubaiCrudeCSV" | "DubaiCrudeAPI";
}

export type ReferencePeriod = {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export type RouteDistance = {
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  city: string;
  country: string;
  distanceKm: number;
  distanceMile: number;
  distanceBandLabel: string;
  source: "MOLIT_ROUTE_DISTANCE";
}

export type Recommendation = "BUY_NOW" | "WAIT" | "NEUTRAL" | "INSUFFICIENT_DATA";

export type AnalysisResult = {
  status: Recommendation
  title: string
  description: string
  selectedTicketingDate: string
  currentIssueMonth: string
  nextIssueMonth: string
  dubaiDataAvailableUntil: string
  fxDataAvailableUntil: string
  effectiveDataUntil: string
  currentPeriod: {
    startDate: string
    endDate: string
    start: string
    end: string
    averageUsd: number | null
    averageKrw: number | null
    dataCount: number
  }
  nextPredictionPeriod: {
    startDate: string
    endDate: string
    start: string
    end: string
    averageUsd: number | null
    averageKrw: number | null
    dataCount: number
  }
  fullNextReferencePeriod: ReferencePeriod
  changeRate: number | null
  selectedRoute: RouteDistance | null
  distanceImpact: {
    level: '낮음' | '보통' | '높음' | '매우 높음'
    label: string
    weight: number
    routeImpactScore: number | null
    routeImpactLabel: '낮음' | '보통' | '높음' | '매우 높음' | null
  }
  routeAdjustedIndex: {
    current: number | null
    next: number | null
    unit: '원/bbl·천마일'
  }
  confidenceProgress: number
  confidenceLabel: '낮음' | '보통' | '높음'
  warnings: string[]
}
