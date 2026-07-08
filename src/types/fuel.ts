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

export type Recommendation = "BUY_NOW" | "WAIT" | "NEUTRAL";
