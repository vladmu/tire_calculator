import { makeAutoObservable } from "mobx";
import { CalculationResults, ValidationState } from "../types/types";
import { calculateNewSizes, MIN_R, MAX_R, MIN_LIMITS, MAX_LIMITS, MIN_PROFILE_GLOBAL } from "../services/calculator";

const WIDTH_STEP = 10;
const PROFILE_STEP = 5;

export class CalculatorStore {
  // Input fields as strings to allow empty state and UI-friendly handling
  R_old: string = "12";
  W_old: string = String(MIN_LIMITS[12][0]);
  V_old: string = String(MIN_LIMITS[12][1]);

  loading = false;
  error: ValidationState = { message: null };

  results: CalculationResults | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get currentR(): number {
    const r = parseInt(this.R_old, 10);
    return Number.isFinite(r) ? r : 12;
  }
  get currentMinW(): number { return MIN_LIMITS[this.currentR as keyof typeof MIN_LIMITS][0]; }
  get currentMaxW(): number { return MAX_LIMITS[this.currentR as keyof typeof MAX_LIMITS][0]; }
  get currentMinV(): number { return Math.max(MIN_PROFILE_GLOBAL, MIN_LIMITS[this.currentR as keyof typeof MIN_LIMITS][1]); }
  get currentMaxV(): number { return MAX_LIMITS[this.currentR as keyof typeof MAX_LIMITS][1]; }

  private clampToStep(value: number, step: number): number {
    // Use floor to step to avoid unexpected jumps upwards on commit
    return Math.floor(value / step) * step;
  }

  setR(val: string) {
    // enforce integer and range 12..25
    const n = parseInt(val, 10);
    if (!Number.isFinite(n)) {
      this.R_old = val;
      return;
    }
    let r = n;
    if (r < MIN_R) r = MIN_R;
    if (r > MAX_R) r = MAX_R;
    this.R_old = String(r);

    // On R change, always reset W and V to per-R minimums so that visible defaults match the tables
    const minW = MIN_LIMITS[r][0];
    const minV = Math.max(MIN_PROFILE_GLOBAL, MIN_LIMITS[r][1]);
    this.W_old = String(minW);
    this.V_old = String(minV);
  }

  // Raw setters: store exactly what user typed without immediate normalization
  setWRaw(val: string) {
    this.W_old = val;
  }

  setVRaw(val: string) {
    this.V_old = val;
  }

  setRRaw(val: string) {
    this.R_old = val;
  }

  setResults(results: CalculationResults | null) {
    this.results = results;
  }

  setErrorMessage(message: string | null) {
    this.error = { message };
  }

  // Commit methods: normalize to step and clamp within dynamic limits
  commitW() {
    const n = parseFloat(this.W_old);
    if (!Number.isFinite(n)) {
      // if empty or non-numeric, default to current min
      this.W_old = String(this.currentMinW);
      return;
    }
    let w = this.clampToStep(n, WIDTH_STEP);
    if (w < this.currentMinW) w = this.currentMinW;
    if (w > this.currentMaxW) w = this.currentMaxW;
    this.W_old = String(w);
  }

  commitV() {
    const n = parseFloat(this.V_old);
    if (!Number.isFinite(n)) {
      this.V_old = String(this.currentMinV);
      return;
    }
    let v = this.clampToStep(n, PROFILE_STEP);
    if (v < this.currentMinV) v = this.currentMinV;
    if (v > this.currentMaxV) v = this.currentMaxV;
    this.V_old = String(v);
  }

  // Increment/decrement APIs for arrow controls
  incrementR() {
    let r = this.currentR + 1;
    if (r > MAX_R) r = MAX_R;
    this.setR(String(r));
  }
  decrementR() {
    let r = this.currentR - 1;
    if (r < MIN_R) r = MIN_R;
    this.setR(String(r));
  }
  incrementW() {
    const n = parseFloat(this.W_old);
    const base = Number.isFinite(n) ? n : this.currentMinW;
    let w = base + 10;
    if (w > this.currentMaxW) w = this.currentMaxW;
    this.W_old = String(w);
  }
  decrementW() {
    const n = parseFloat(this.W_old);
    const base = Number.isFinite(n) ? n : this.currentMinW;
    let w = base - 10;
    if (w < this.currentMinW) w = this.currentMinW;
    this.W_old = String(w);
  }
  incrementV() {
    const n = parseFloat(this.V_old);
    const base = Number.isFinite(n) ? n : this.currentMinV;
    let v = base + PROFILE_STEP;
    if (v > this.currentMaxV) v = this.currentMaxV;
    this.V_old = String(v);
  }
  decrementV() {
    const n = parseFloat(this.V_old);
    const base = Number.isFinite(n) ? n : this.currentMinV;
    let v = base - PROFILE_STEP;
    if (v < this.currentMinV) v = this.currentMinV;
    this.V_old = String(v);
  }

  // Backward-compatible setters that immediately commit (used programmatically/tests)
  setW(val: string) {
    this.setWRaw(val);
    this.commitW();
  }

  setV(val: string) {
    this.setVRaw(val);
    this.commitV();
  }

  reset() {
    this.R_old = "12";
    this.W_old = String(MIN_LIMITS[12][0]);
    this.V_old = String(Math.max(MIN_PROFILE_GLOBAL, MIN_LIMITS[12][1]));
    this.error = { message: null };
    this.results = null;
  }

  get isReady(): boolean {
    return this.R_old !== "" && this.W_old !== "" && this.V_old !== "";
  }

  get parsed(): { R: number; W: number; V: number } | null {
    const R = parseFloat(this.R_old);
    const W = parseFloat(this.W_old);
    const V = parseFloat(this.V_old);
    if (Number.isFinite(R) && Number.isFinite(W) && Number.isFinite(V)) {
      return { R, W, V };
    }
    return null;
  }

  validate(): string | null {
    const p = this.parsed;
    if (!p) return "Будь ласка, введіть коректні числові значення.";
    const { R, W, V } = p;

    if (!Number.isInteger(R)) return "Діаметр диска (R) має бути цілим числом.";
    if (R < MIN_R || R > MAX_R) return `Діаметр диска має бути в діапазоні ${MIN_R}–${MAX_R}.`;

    if (V < MIN_PROFILE_GLOBAL) return "Профіль (V) не менше 20%.";
    if (W % 5 !== 0 || V % 5 !== 0) return "Ширина (W) і Профіль (V) мають бути кратні 5.";

    return null;
  }

  calculate() {
    this.error = { message: null };
    this.results = null;

    const err = this.validate();
    if (err) {
      this.error = { message: err };
      return;
    }

    const p = this.parsed!;
    const results = calculateNewSizes({ R_old: p.R, W_old: p.W, V_old: p.V });

    if (results.resultsMain.length === 0 && !results.bestAlternativeResult) {
      this.error = { message: "Неможливо знайти жодного варіанта, що відповідає всім критеріям, включаючи обмеження дельти 2%." };
      return;
    }

    this.results = results;
  }
}

export const calculatorStore = new CalculatorStore();
