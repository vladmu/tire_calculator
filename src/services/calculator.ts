import { CalculationInput, CalculationResults, LimitsTable, SingleProfileResult } from "../types/types";

// Constants
export const INCH_TO_MM = 25.4;
export const MIN_PROFILE_GLOBAL = 20;
export const MIN_R = 12;
export const MAX_R = 25;
export const MAX_WIDTH_SEARCH_DELTA = 40;
export const WIDTH_STEP = 10;
export const MAX_DELTA_PERCENT = 2.0; // Максимальна дельта 2%

// МІНІМАЛЬНІ ЛІМІТИ: [Мінімальна Ширина, Мінімальний Профіль]
export const MIN_LIMITS: LimitsTable = {
  12: [135, 60], 13: [145, 55], 14: [145, 50], 15: [155, 35],
  16: [165, 35], 17: [185, 35], 18: [205, 30], 19: [225, 25],
  20: [225, 25], 21: [235, 25], 22: [235, 25], 23: [235, 25],
  24: [245, 20], 25: [245, 20]
};

// МАКСИМАЛЬНІ ЛІМІТИ: [Максимальна Ширина, Максимальний Профіль]
export const MAX_LIMITS: LimitsTable = {
  12: [205, 90], 13: [225, 90], 14: [265, 90], 15: [315, 90],
  16: [315, 85], 17: [335, 75], 18: [345, 70], 19: [355, 65],
  20: [355, 65], 21: [355, 55], 22: [355, 55], 23: [355, 40],
  24: [355, 40], 25: [355, 35]
};

export function checkAllLimits(R_new: number, W_new: number, V_new: number): boolean {
  if (R_new < MIN_R || R_new > MAX_R || R_new % 1 !== 0) return false;

  const [minW, minV] = MIN_LIMITS[R_new as keyof typeof MIN_LIMITS];
  const [maxW, maxV] = MAX_LIMITS[R_new as keyof typeof MAX_LIMITS];

  return !(
    V_new < MIN_PROFILE_GLOBAL ||
    W_new < minW || V_new < minV ||
    W_new > maxW || V_new > maxV
  );
}

export function calculateTotalDiameter(D_inch: number, W_mm: number, V_percent: number): number {
  const D_mm = D_inch * INCH_TO_MM;
  const H_mm = W_mm * (V_percent / 100);
  return D_mm + 2 * H_mm;
}

export function calculateSingleProfileOption(
  R_new: number,
  W_new: number,
  V_new: number,
  D_total_old: number,
  enforceDeltaCap: boolean = true
): SingleProfileResult | null {
  const D_total_new = calculateTotalDiameter(R_new, W_new, V_new);
  const delta = D_total_new - D_total_old;
  const delta_percent = (delta / D_total_old) * 100;
  const newSize = `${W_new}/${V_new} R${R_new}`;

  if (enforceDeltaCap && Math.abs(delta_percent) > MAX_DELTA_PERCENT) {
    return null;
  }

  return { W_new, R_new, V_new, D_total_new, delta, delta_percent, newSize };
}

export function calculateOption(W_new: number, D_total_old: number, R_new: number, relaxed: boolean = false): SingleProfileResult | null {
  const D_disk_mm_new = R_new * INCH_TO_MM;
  const H_needed = (D_total_old - D_disk_mm_new) / 2;

  if (H_needed <= 0) return null;

  const V_needed_float = (H_needed / W_new) * 100;

  const step = 5;
  let V_A = Math.max(MIN_PROFILE_GLOBAL, Math.floor(V_needed_float / step) * step);
  let V_B = Math.max(MIN_PROFILE_GLOBAL, Math.ceil(V_needed_float / step) * step);

  let bestResult: SingleProfileResult | null = null;

  const passesLimitsA = checkAllLimits(R_new, W_new, V_A);
  const result_A = calculateSingleProfileOption(R_new, W_new, V_A, D_total_old, !relaxed);

  let result_B: SingleProfileResult | null = null;
  const passesLimitsB = checkAllLimits(R_new, W_new, V_B);
  if (V_A !== V_B) {
    result_B = calculateSingleProfileOption(R_new, W_new, V_B, D_total_old, !relaxed);
  }

  const finalResults: SingleProfileResult[] = [];
  if (passesLimitsA && result_A) finalResults.push(result_A);
  if (V_A !== V_B && passesLimitsB && result_B) finalResults.push(result_B);

  // If neither A nor B works, and we're in relaxed mode, try clamping V to per-R limits
  if (finalResults.length === 0) {
    if (relaxed) {
      const [minW, minV] = MIN_LIMITS[R_new as keyof typeof MIN_LIMITS];
      const [maxW, maxV] = MAX_LIMITS[R_new as keyof typeof MAX_LIMITS];
      if (W_new >= minW && W_new <= maxW) {
        const rounded = Math.round(V_needed_float / step) * step;
        const V_clamped = Math.min(maxV, Math.max(minV, rounded));
        const fallback = calculateSingleProfileOption(R_new, W_new, V_clamped, D_total_old, false)!;
        fallback.V_needed_float = V_needed_float;
        return fallback;
      }
    }
    return null;
  }

  if (finalResults.length === 1) {
    bestResult = finalResults[0];
  } else {
    bestResult = Math.abs(finalResults[0].delta) <= Math.abs(finalResults[1].delta)
      ? finalResults[0]
      : finalResults[1];
  }

  (bestResult as SingleProfileResult).V_needed_float = V_needed_float;

  return bestResult;
}

export function findBestOptionForWidth(W_new: number, D_total_old: number, baseR: number, relaxed: boolean = false): SingleProfileResult | null {
  let bestWOption: SingleProfileResult | null = null;
  let bestWOptionR = MIN_R - 1; // track best R to prioritize larger R

  // Enforce R_new > baseR to avoid suggesting smaller rims.
  // If baseR is already at MAX_R, allow equal (otherwise search would be impossible).
  const minRInclusive = baseR >= MAX_R ? baseR : baseR + 1;

  for (let R = MAX_R; R >= minRInclusive; R--) {
    const result = calculateOption(W_new, D_total_old, R, relaxed);
    if (result) {
      if (R > bestWOptionR) {
        bestWOption = result;
        bestWOptionR = R;
      }
    }
  }
  return bestWOption;
}

export function pickBetterAlternative(current: SingleProfileResult | null, candidate: SingleProfileResult): SingleProfileResult {
  if (!current) return candidate;
  if (candidate.R_new > current.R_new) return candidate;
  if (candidate.R_new === current.R_new && Math.abs(candidate.delta) < Math.abs(current.delta)) return candidate;
  return current;
}

export function calculateNewSizes({ R_old, W_old, V_old }: CalculationInput): CalculationResults {
  const D_total_old = calculateTotalDiameter(R_old, W_old, V_old);
  const initialSizeKey = `${W_old}/${V_old} R${R_old}`;

  let bestMainResult: SingleProfileResult | null = null;
  let bestMainDeltaAbs = Infinity;
  const resultsMain: SingleProfileResult[] = [];

  const mainWidths = [W_old, W_old + WIDTH_STEP, W_old + 2 * WIDTH_STEP];
  mainWidths.forEach((W) => {
    // Try strict (±2%) first; if none exists, fall back to the closest permissible option
    let bestOptionForW = findBestOptionForWidth(W, D_total_old, R_old, false);
    if (!bestOptionForW) {
      bestOptionForW = findBestOptionForWidth(W, D_total_old, R_old, true);
    }
    if (bestOptionForW) {
      // Always include the best option for each main width (W, W+10, W+20),
      // even if it equals the initial size. If strict option is not available,
      // we include the closest permissible option (may exceed ±2%).
      resultsMain.push(bestOptionForW);
      if (Math.abs(bestOptionForW.delta) < bestMainDeltaAbs) {
        bestMainDeltaAbs = Math.abs(bestOptionForW.delta);
        bestMainResult = bestOptionForW;
      }
    }
  });

  let bestAlternativeResult: SingleProfileResult | null = null;
  const altWidths: number[] = [];
  for (let W = W_old + 3 * WIDTH_STEP; W <= W_old + MAX_WIDTH_SEARCH_DELTA; W += WIDTH_STEP) altWidths.push(W);
  for (let W = W_old - WIDTH_STEP; W >= W_old - MAX_WIDTH_SEARCH_DELTA && W >= 100; W -= WIDTH_STEP) altWidths.push(W);

  // Determine the largest rim size achieved in the main range
  const maxMainR = resultsMain.length > 0
    ? resultsMain.reduce((max, r) => (r.R_new > max ? r.R_new : max), R_old)
    : R_old;

  // Alternative should prioritize larger rim sizes than any main option.
  // Among those with larger R, pick the one with the smallest absolute delta.
  altWidths.forEach((W) => {
    const bestOptionForW = findBestOptionForWidth(W, D_total_old, R_old);
    if (bestOptionForW && bestOptionForW.R_new > maxMainR) {
      bestAlternativeResult = pickBetterAlternative(bestAlternativeResult, bestOptionForW);
    }
  });

  return { initialSizeKey, D_total_old, resultsMain, bestMainResult, bestAlternativeResult };
}
