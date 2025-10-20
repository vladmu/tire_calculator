
export type LimitPair = [number, number];

export interface LimitsTable {
  [radius: number]: LimitPair;
}

export interface SingleProfileResult {
  W_new: number;
  R_new: number;
  V_new: number;
  D_total_new: number;
  delta: number;
  delta_percent: number;
  newSize: string;
  V_needed_float?: number;
}

export interface CalculationInput {
  R_old: number;
  W_old: number;
  V_old: number;
}

export interface CalculationResults {
  initialSizeKey: string;
  D_total_old: number;
  resultsMain: SingleProfileResult[];
  bestMainResult: SingleProfileResult | null;
  bestAlternativeResult: SingleProfileResult | null;
}

export interface ValidationState {
  message: string | null;
}
