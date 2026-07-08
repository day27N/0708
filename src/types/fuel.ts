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

export type Recommendation = "BUY_NOW" | "WAIT" | "NEUTRAL";

export type AnalysisResult = {
  selectedTicketingDate: string
  issueMonth: string
  nextIssueMonth: string
  availableUntil: string
  currentPeriod: ReferencePeriod
  nextPredictionPeriod: ReferencePeriod
  fullNextReferencePeriod: ReferencePeriod
  currentAverage: number | null
  currentCount: number
  nextAverage: number | null
  nextCount: number
  changeRate: number | null
  confidence: {
    progress: number
    label: string
  }
  recommendation: Recommendation
  recommendationText: {
    title: string
    desc: string
  }
  nowPrice?: number | null
  laterPrice?: number | null
  monthlyAverages?: {month:string, average:number|null, count:number}[]
}
