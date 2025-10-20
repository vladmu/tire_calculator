import { CalculatorStore } from './CalculatorStore';
import * as calc from '../services/calculator';

describe('CalculatorStore validation', () => {
  test('invalid numbers', () => {
    const s = new CalculatorStore();
    s.setR(''); s.setW(''); s.setV('');
    expect(s.validate()).toBe('Будь ласка, введіть коректні числові значення.');
  });

  test('R must be integer', () => {
    const s = new CalculatorStore();
    // Simulate a non-integer R by setting raw string directly
    s.R_old = '17.5';
    s.setW('205'); s.setV('50');
    expect(s.validate()).toBe('Діаметр диска (R) має бути цілим числом.');
  });

  test('commitW/commitV default to per-R mins on non-numeric and clamp within limits', () => {
    const s = new CalculatorStore();
    s.setR('17');
    // Non-numeric -> default to min on commit
    s.setWRaw('');
    s.commitW();
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[17][0]));
    s.setVRaw('');
    s.commitV();
    const minV = Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[17][1]);
    expect(s.V_old).toBe(String(minV));
    // Over max -> clamp down
    s.setWRaw('10000'); s.commitW();
    expect(parseInt(s.W_old, 10)).toBeLessThanOrEqual(calc.MAX_LIMITS[17][0]);
    s.setVRaw('100'); s.commitV();
    expect(parseInt(s.V_old, 10)).toBeLessThanOrEqual(calc.MAX_LIMITS[17][1]);
  });

  test('R range', () => {
    const s = new CalculatorStore();
    s.R_old = '50';
    expect(s.validate()).toMatch(/Діаметр диска має бути в діапазоні/);
  });

  test('V min and W/V steps', () => {
    const s = new CalculatorStore();
    s.setR('17');
    // Intentionally set raw values to avoid immediate normalization
    s.W_old = '203';
    s.V_old = '15';
    // V < 20 should short-circuit first
    expect(s.validate()).toBe('Профіль (V) не менше 20%.');
    s.V_old = '25';
    expect(s.validate()).toBe('Ширина (W) і Профіль (V) мають бути кратні 5.');
  });
});

describe('CalculatorStore calculate', () => {
  test('sets error when no results found', () => {
    const s = new CalculatorStore();
    s.setR('17'); s.setW('205'); s.setV('50');

    const spy = jest.spyOn(calc, 'calculateNewSizes').mockReturnValue({
      initialSizeKey: '205/50 R17',
      D_total_old: 0,
      resultsMain: [],
      bestMainResult: null,
      bestAlternativeResult: null
    });

    s.calculate();
    expect(s.error.message).toMatch(/Неможливо знайти жодного варіанта/);
    expect(s.results).toBeNull();

    spy.mockRestore();
  });

  test('sets results on success', () => {
    const s = new CalculatorStore();
    s.setR('17'); s.setW('205'); s.setV('50');

    const mockResults = {
      initialSizeKey: '205/50 R17',
      D_total_old: 10,
      resultsMain: [{ W_new: 215, R_new: 18, V_new: 45, D_total_new: 11, delta: 1, delta_percent: 10, newSize: '215/45 R18' }],
      bestMainResult: null,
      bestAlternativeResult: null
    } as any;

    const spy = jest.spyOn(calc, 'calculateNewSizes').mockReturnValue(mockResults);
    s.calculate();
    expect(s.error.message).toBeNull();
    expect(s.results).toEqual(mockResults);
    spy.mockRestore();
  });
});



describe('CalculatorStore extras', () => {
  test('reset restores per-R minimum defaults and clears error/results', () => {
    const s = new CalculatorStore();
    s.setR('17'); s.setW('205'); s.setV('50');
    s.setErrorMessage('err');
    s.setResults({} as any);
    s.reset();
    expect(s.R_old).toBe('12');
    expect(s.W_old).toBe('135');
    expect(s.V_old).toBe('60');
    expect(s.error.message).toBeNull();
    expect(s.results).toBeNull();
  });

  test('isReady reflects input readiness', () => {
    const s = new CalculatorStore();
    // Defaults are pre-filled with per-R minimums, so ready by default
    expect(s.isReady).toBe(true);
    // Clearing a field makes it not ready
    s.R_old = '';
    expect(s.isReady).toBe(false);
    // Restoring fields returns to ready state
    s.setR('17'); s.setW('205'); s.setV('50');
    expect(s.isReady).toBe(true);
  });

  test('increment/decrement R/W/V clamp within limits and reset on R change', () => {
    const s = new CalculatorStore();
    // Start at defaults R=12 (min), W=135, V=60
    s.decrementR(); // should stay at 12
    expect(s.R_old).toBe('12');

    // Increment R 5 times -> 17, and W/V reset to per-R mins
    for (let i = 0; i < 5; i++) s.incrementR();
    expect(s.R_old).toBe('17');
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[17][0])); // 185
    expect(s.V_old).toBe(String(Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[17][1]))); // 35

    // W increment by 10 twice (185 -> 205)
    s.incrementW(); s.incrementW();
    expect(s.W_old).toBe('205');
    // W decrement once (205 -> 195), but min for R17 is 185; ensure step and clamp work when going below
    s.decrementW();
    expect(s.W_old).toBe('195');
    // Decrement many times clamps to min
    for (let i = 0; i < 5; i++) s.decrementW();
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[17][0])); // 185

    // V increment by 5 three times (35 -> 50)
    s.incrementV(); s.incrementV(); s.incrementV();
    expect(s.V_old).toBe('50');
    // V decrement below min clamps to min
    for (let i = 0; i < 10; i++) s.decrementV();
    expect(s.V_old).toBe(String(Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[17][1]))); // 35

    // Hitting max bounds
    // Set R to 25 and try to increment beyond
    s.setR('25');
    s.incrementR();
    expect(s.R_old).toBe('25');
    // For R=25, maxW is calc.MAX_LIMITS[25][0], maxV is calc.MAX_LIMITS[25][1]
    // Bump W and V to their maxima via many increments, then try to go beyond
    for (let i = 0; i < 30; i++) s.incrementW();
    for (let i = 0; i < 30; i++) s.incrementV();
    expect(parseInt(s.W_old, 10)).toBeLessThanOrEqual(calc.MAX_LIMITS[25][0]);
    expect(parseInt(s.V_old, 10)).toBeLessThanOrEqual(calc.MAX_LIMITS[25][1]);
    const wAtMax = parseInt(s.W_old, 10);
    const vAtMax = parseInt(s.V_old, 10);
    s.incrementW(); s.incrementV();
    expect(parseInt(s.W_old, 10)).toBe(wAtMax);
    expect(parseInt(s.V_old, 10)).toBe(vAtMax);
  });
});



describe('CalculatorStore setR resets W/V to per-R minimums on change', () => {
  test('stepping R: 12 -> 13 -> 14 -> 13 -> 12 updates W/V to table mins', () => {
    const s = new CalculatorStore();
    // initial defaults
    expect(s.R_old).toBe('12');
    expect(s.W_old).toBe('135');
    expect(s.V_old).toBe('60');

    // 12 -> 13
    s.setR('13');
    expect(s.R_old).toBe('13');
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[13][0]));
    const minV13 = Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[13][1]);
    expect(s.V_old).toBe(String(minV13)); // 55

    // 13 -> 14
    s.setR('14');
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[14][0])); // 145
    const minV14 = Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[14][1]);
    expect(s.V_old).toBe(String(minV14)); // 50

    // back to 13
    s.setR('13');
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[13][0])); // 145
    expect(s.V_old).toBe(String(minV13)); // 55

    // back to 12
    s.setR('12');
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[12][0])); // 135
    const minV12 = Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[12][1]);
    expect(s.V_old).toBe(String(minV12)); // 60
  });
});



describe('CalculatorStore additional branch coverage', () => {
  test('setR handles non-numeric string and clamps below/above bounds', () => {
    const s = new CalculatorStore();
    // Change W/V to custom values first, to ensure non-numeric R does not reset them
    s.setR('13');
    s.setW('155');
    s.setV('55');

    // Non-numeric: R_old should become raw string and W/V remain unchanged
    s.setR('abc');
    expect(s.R_old).toBe('abc');
    expect(s.W_old).toBe('150');
    expect(s.V_old).toBe('55');

    // Below MIN_R clamps to 12 and resets W/V to per-R minimums
    s.setR('1');
    expect(s.R_old).toBe(String(calc.MIN_R));
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[calc.MIN_R][0]));
    expect(s.V_old).toBe(String(Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[calc.MIN_R][1])));

    // Above MAX_R clamps to MAX_R and resets W/V
    s.setR('999');
    expect(s.R_old).toBe(String(calc.MAX_R));
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[calc.MAX_R][0]));
    expect(s.V_old).toBe(String(Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[calc.MAX_R][1])));
  });

  test('increment/decrement W/V use min values as base when raw inputs are non-numeric', () => {
    const s = new CalculatorStore();
    s.setR('17');

    // Non-numeric W -> increment uses currentMinW as base (185 -> 195)
    s.setWRaw('');
    s.incrementW();
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[17][0] + 10));

    // Non-numeric again, decrement goes to min (base 185 - 10 clamped to 185)
    s.setWRaw('');
    s.decrementW();
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[17][0]));

    // Non-numeric V -> increment uses currentMinV as base (35 -> 40)
    s.setVRaw('');
    s.incrementV();
    const minV = Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[17][1]);
    expect(s.V_old).toBe(String(minV + 5));

    // Non-numeric again, decrement clamps to min (35)
    s.setVRaw('');
    s.decrementV();
    expect(s.V_old).toBe(String(minV));
  });

  test('calculate sets validation error when inputs are invalid', () => {
    const s = new CalculatorStore();
    // Make inputs invalid (empty)
    s.setRRaw(''); s.setWRaw(''); s.setVRaw('');
    s.calculate();
    expect(s.error.message).toBe('Будь ласка, введіть коректні числові значення.');
    expect(s.results).toBeNull();
  });
});



describe('CalculatorStore commit clamps below minimum for numeric inputs', () => {
  test('commitW/commitV clamp up to current minimum when given small numeric', () => {
    const s = new CalculatorStore();
    s.setR('17');
    s.setWRaw('1');
    s.commitW();
    expect(s.W_old).toBe(String(calc.MIN_LIMITS[17][0]));

    s.setVRaw('1');
    s.commitV();
    const minV = Math.max(calc.MIN_PROFILE_GLOBAL, calc.MIN_LIMITS[17][1]);
    expect(s.V_old).toBe(String(minV));
  });
});
