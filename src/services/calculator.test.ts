import {
  checkAllLimits,
  calculateTotalDiameter,
  calculateSingleProfileOption,
  calculateOption,
  findBestOptionForWidth,
  calculateNewSizes,
  MIN_R,
  MAX_R,
  INCH_TO_MM,
  pickBetterAlternative,
} from './calculator';

describe('calculator service', () => {
  test('checkAllLimits enforces R range and integer', () => {
    expect(checkAllLimits(MIN_R - 1, 200, 50)).toBe(false);
    expect(checkAllLimits(MAX_R + 1, 200, 50)).toBe(false);
    expect(checkAllLimits(16.5, 235, 45)).toBe(false);
  });

  test('checkAllLimits enforces per-R width/profile mins and maxes and global profile', () => {
    // For R=12: min [135,60], max [205,90]
    expect(checkAllLimits(12, 120, 60)).toBe(false); // width below min
    expect(checkAllLimits(12, 135, 50)).toBe(false); // profile below min
    expect(checkAllLimits(12, 300, 70)).toBe(false); // width above max
    expect(checkAllLimits(12, 200, 95)).toBe(false); // profile above max
    expect(checkAllLimits(17, 235, 15)).toBe(false); // global profile < 20

    // A valid case
    expect(checkAllLimits(17, 235, 40)).toBe(true);
  });

  test('calculateTotalDiameter basic arithmetic', () => {
    // 17" rim + 2 * (235 * 0.45)
    const d = calculateTotalDiameter(17, 235, 45);
    expect(d).toBeCloseTo(17 * INCH_TO_MM + 2 * (235 * 0.45), 6);
  });

  test('calculateSingleProfileOption returns null if delta percent > 2%', () => {
    const oldD = calculateTotalDiameter(17, 235, 45);
    // New very different (should exceed 2%)
    const opt = calculateSingleProfileOption(25, 355, 35, oldD);
    expect(opt).toBeNull();
  });

  test('calculateSingleProfileOption returns result when within delta', () => {
    const oldD = calculateTotalDiameter(20, 225, 45);
    const opt = calculateSingleProfileOption(20, 225, 45, oldD);
    expect(opt).not.toBeNull();
    expect(opt!.delta).toBeCloseTo(0, 6);
    expect(opt!.newSize).toBe('225/45 R20');
  });

  test('calculateOption returns null when H_needed <= 0', () => {
    const oldD = calculateTotalDiameter(12, 135, 60); // small total diameter
    const res = calculateOption(245, oldD, 25); // very large rim -> H_needed negative
    expect(res).toBeNull();
  });

  test('calculateOption V_A === V_B path (exact multiple of 5)', () => {
    // Choose values to make V_needed_float exactly 40
    const R = 20;
    const W = 225; // meets min for R20
    const D_disk = R * INCH_TO_MM; // 508
    const H_needed = 0.40 * W; // 90
    const oldD = D_disk + 2 * H_needed; // 688
    const res = calculateOption(W, oldD, R);
    expect(res).not.toBeNull();
    expect(res!.V_new).toBe(40);
    expect(res!.delta).toBeCloseTo(0, 6);
    expect(res!.V_needed_float).toBeCloseTo(40, 6);
  });

  test('calculateOption only A valid when B exceeds max profile', () => {
    // For R=21 maxV is 55. Make V_needed_float ~57.1 so A=55 valid, B=60 invalid
    const R = 21;
    const W = 235; // meets min for R21
    const D_disk = R * INCH_TO_MM; // 533.4
    const V_needed = 57.1;
    const H_needed = (V_needed / 100) * W; // ~134.165
    const oldD = D_disk + 2 * H_needed; // ~801.73

    const res = calculateOption(W, oldD, R);
    expect(res).not.toBeNull();
    expect(res!.V_new).toBe(55); // chose A only
  });

  test('calculateOption chooses smaller absolute delta between A and B', () => {
    // Choose V_needed between 50 and 55 => both valid for R=20
    const R = 20;
    const W = 235; // meets min for R20
    const D_disk = R * INCH_TO_MM;
    const V_needed = 52.6; // A=50, B=55
    const H_needed = (V_needed / 100) * W;
    const oldD = D_disk + 2 * H_needed;

    const res = calculateOption(W, oldD, R)!;
    // Which is closer? distance to 50 => 2.6; to 55 => 2.4 => expect 55
    expect(res.V_new).toBe(55);
    expect(res.V_needed_float).toBeCloseTo(V_needed, 6);
  });

  test('findBestOptionForWidth prioritizes larger R for same width', () => {
    // Use an oldD that makes multiple R produce valid options
    const oldD = calculateTotalDiameter(19, 245, 45);
    const W = 245;
    const res = findBestOptionForWidth(W, oldD, 19);
    expect(res).not.toBeNull();
    expect(res!.R_new).toBeGreaterThanOrEqual(19); // prefer >= 19 here
  });

  test('calculateNewSizes returns main results and possibly alternative (alternative must increase rim size)', () => {
    const input = { R_old: 17, W_old: 225, V_old: 45 };
    const results = calculateNewSizes(input);
    expect(results.initialSizeKey).toBe('225/45 R17');
    expect(results.D_total_old).toBeGreaterThan(0);
    expect(Array.isArray(results.resultsMain)).toBe(true);
    const maxMainR = Math.max(...results.resultsMain.map(r => r.R_new));
    const alt = results.bestAlternativeResult;
    expect(!alt || alt.R_new > maxMainR).toBe(true);
  });
});


  test('calculateOption returns null when no profiles pass limits (finalResults empty)', () => {
    const R = 20;
    const W = 225; // meets min for R20
    const V_needed = 80; // exceeds maxV for R20, so both A and B will fail limits
    const D_disk = R * INCH_TO_MM;
    const H_needed = (V_needed / 100) * W;
    const oldD = D_disk + 2 * H_needed;
    const res = calculateOption(W, oldD, R);
    expect(res).toBeNull();
  });



test('calculateNewSizes includes initial size in main results (W+0)', () => {
  const input = { R_old: 25, W_old: 245, V_old: 20 };
  const res = calculateNewSizes(input);
  expect(res.initialSizeKey).toBe('245/20 R25');
  const hasInitial = res.resultsMain.some(r => r.newSize === res.initialSizeKey);
  expect(hasInitial).toBe(true);
});



test('calculateOption only B valid when A below per-R minV', () => {
  // R=19 has minV=25; choose V_needed ~22.4 so A=20 invalid, B=25 valid
  const R = 19;
  const W = 225; // meets min for R19
  const D_disk = R * INCH_TO_MM;
  const V_needed = 23.5; // A=20 (invalid for R19), B=25 (valid) and within 2% delta for B
  const H_needed = (V_needed / 100) * W;
  const oldD = D_disk + 2 * H_needed;
  const res = calculateOption(W, oldD, R);
  expect(res).not.toBeNull();
  expect(res!.V_new).toBe(25);
});


test('calculateNewSizes alt widths loop hits no-option branch (bestOptionForWidth null for some W)', () => {
  // W_old=100 -> first alt width is 130, which is below min W for all R (minW >= 135) => findBestOptionForWidth returns null
  const input = { R_old: 12, W_old: 100, V_old: 60 };
  const res = calculateNewSizes(input);
  expect(res.initialSizeKey).toBe('100/60 R12');
  // We don't assert alternative existence; goal is to execute code path safely
  expect(Array.isArray(res.resultsMain)).toBe(true);
});



test('calculateNewSizes produces three main cards for 285/90 R17 via relaxed clamp and never reduces R', () => {
  const input = { R_old: 17, W_old: 285, V_old: 90 };
  const res = calculateNewSizes(input);
  const widths = res.resultsMain.map(r => r.W_new).sort((a,b) => a - b);
  expect(widths).toEqual([285, 295, 305]);
  expect(res.resultsMain).toHaveLength(3);
  // Ensure no suggested rim is smaller than base R
  res.resultsMain.forEach(r => expect(r.R_new).toBeGreaterThan(17));
});

/*
describe('calculator service', () => {
  test('checkAllLimits enforces R range and integer', () => {
    expect(checkAllLimits(MIN_R - 1, 200, 50)).toBe(false);
    expect(checkAllLimits(MAX_R + 1, 200, 50)).toBe(false);
    expect(checkAllLimits(16.5 as any, 235, 45)).toBe(false);
  });

  test('checkAllLimits enforces per-R width/profile mins and maxes and global profile', () => {
    // For R=12: min [135,60], max [205,90]
    expect(checkAllLimits(12, 120, 60)).toBe(false); // width below min
    expect(checkAllLimits(12, 135, 50)).toBe(false); // profile below min
    expect(checkAllLimits(12, 300, 70)).toBe(false); // width above max
    expect(checkAllLimits(12, 200, 95)).toBe(false); // profile above max
    expect(checkAllLimits(17, 235, 15)).toBe(false); // global profile < 20

    // A valid case
    expect(checkAllLimits(17, 235, 40)).toBe(true);
  });

  test('calculateTotalDiameter basic arithmetic', () => {
    // 17" rim + 2 * (235 * 0.45)
    const d = calculateTotalDiameter(17, 235, 45);
    expect(d).toBeCloseTo(17 * INCH_TO_MM + 2 * (235 * 0.45), 6);
  });

  test('calculateSingleProfileOption returns null if delta percent > 2%', () => {
    const oldD = calculateTotalDiameter(17, 235, 45);
    // New very different (should exceed 2%)
    const opt = calculateSingleProfileOption(25, 355, 35, oldD);
    expect(opt).toBeNull();
  });

  test('calculateSingleProfileOption returns result when within delta', () => {
    const oldD = calculateTotalDiameter(20, 225, 45);
    const opt = calculateSingleProfileOption(20, 225, 45, oldD);
    expect(opt).not.toBeNull();
    expect(opt!.delta).toBeCloseTo(0, 6);
    expect(opt!.newSize).toBe('225/45 R20');
  });

  test('calculateOption returns null when H_needed <= 0', () => {
    const oldD = calculateTotalDiameter(12, 135, 60); // small total diameter
    const res = calculateOption(245, oldD, 25); // very large rim -> H_needed negative
    expect(res).toBeNull();
  });

  test('calculateOption V_A === V_B path (exact multiple of 5)', () => {
    // Choose values to make V_needed_float exactly 40
    const R = 20;
    const W = 225; // meets min for R20
    const D_disk = R * INCH_TO_MM; // 508
    const H_needed = 0.40 * W; // 90
    const oldD = D_disk + 2 * H_needed; // 688
    const res = calculateOption(W, oldD, R);
    expect(res).not.toBeNull();
    expect(res!.V_new).toBe(40);
    expect(res!.delta).toBeCloseTo(0, 6);
    expect(res!.V_needed_float).toBeCloseTo(40, 6);
  });

  test('calculateOption only A valid when B exceeds max profile', () => {
    // For R=21 maxV is 55. Make V_needed_float ~57.1 so A=55 valid, B=60 invalid
    const R = 21;
    const W = 235; // meets min for R21
    const D_disk = R * INCH_TO_MM; // 533.4
    const V_needed = 57.1;
    const H_needed = (V_needed / 100) * W; // ~134.165
    const oldD = D_disk + 2 * H_needed; // ~801.73

    const res = calculateOption(W, oldD, R);
    expect(res).not.toBeNull();
    expect(res!.V_new).toBe(55); // chose A only
  });

  test('calculateOption chooses smaller absolute delta between A and B', () => {
    // Choose V_needed between 50 and 55 => both valid for R=20
    const R = 20;
    const W = 235; // meets min for R20
    const D_disk = R * INCH_TO_MM;
    const V_needed = 52.6; // A=50, B=55
    const H_needed = (V_needed / 100) * W;
    const oldD = D_disk + 2 * H_needed;

    const res = calculateOption(W, oldD, R)!;
    // Which is closer? distance to 50 => 2.6; to 55 => 2.4 => expect 55
    expect(res.V_new).toBe(55);
    expect(res.V_needed_float).toBeCloseTo(V_needed, 6);
  });

  test('findBestOptionForWidth prioritizes larger R for same width', () => {
    // Use an oldD that makes multiple R produce valid options
    const oldD = calculateTotalDiameter(19, 245, 45);
    const W = 245;
    const res = findBestOptionForWidth(W, oldD, 19);
    expect(res).not.toBeNull();
    expect(res!.R_new).toBeGreaterThanOrEqual(19); // prefer >= 19 here
  });

  test('calculateNewSizes returns main results and possibly alternative (alternative must increase rim size)', () => {
    const input = { R_old: 17, W_old: 225, V_old: 45 };
    const results = calculateNewSizes(input);
    expect(results.initialSizeKey).toBe('225/45 R17');
    expect(results.D_total_old).toBeGreaterThan(0);
    expect(Array.isArray(results.resultsMain)).toBe(true);
    const maxMainR = Math.max(...results.resultsMain.map(r => r.R_new));
    if (results.bestAlternativeResult) {
      expect(results.bestAlternativeResult.R_new).toBeGreaterThan(maxMainR);
    }
  });
});


  test('calculateOption returns null when no profiles pass limits (finalResults empty)', () => {
    const R = 20;
    const W = 225; // meets min for R20
    const V_needed = 80; // exceeds maxV for R20, so both A and B will fail limits
    const D_disk = R * INCH_TO_MM;
    const H_needed = (V_needed / 100) * W;
    const oldD = D_disk + 2 * H_needed;
    const res = calculateOption(W, oldD, R);
    expect(res).toBeNull();
  });




test('calculateNewSizes includes initial size in main results (W+0)', () => {
  const input = { R_old: 25, W_old: 245, V_old: 20 };
  const res = calculateNewSizes(input);
  expect(res.initialSizeKey).toBe('245/20 R25');
  const hasInitial = res.resultsMain.some(r => r.newSize === res.initialSizeKey);
  expect(hasInitial).toBe(true);
});




test('calculateOption only B valid when A below per-R minV', () => {
  // R=19 has minV=25; choose V_needed ~22.4 so A=20 invalid, B=25 valid
  const R = 19;
  const W = 225; // meets min for R19
  const D_disk = R * INCH_TO_MM;
  const V_needed = 23.5; // A=20 (invalid for R19), B=25 (valid) and within 2% delta for B
  const H_needed = (V_needed / 100) * W;
  const oldD = D_disk + 2 * H_needed;
  const res = calculateOption(W, oldD, R);
  expect(res).not.toBeNull();
  expect(res!.V_new).toBe(25);
});



test('calculateNewSizes alt widths loop hits no-option branch (bestOptionForWidth null for some W)', () => {
  // W_old=100 -> first alt width is 130, which is below min W for all R (minW >= 135) => findBestOptionForWidth returns null
  const input = { R_old: 12, W_old: 100, V_old: 60 };
  const res = calculateNewSizes(input);
  expect(res.initialSizeKey).toBe('100/60 R12');
  // We don't assert alternative existence; goal is to execute code path safely
  expect(Array.isArray(res.resultsMain)).toBe(true);
});



test('calculateNewSizes produces three main cards for 285/90 R17 via relaxed clamp and never reduces R', () => {
  const input = { R_old: 17, W_old: 285, V_old: 90 };
  const res = calculateNewSizes(input);
  const widths = res.resultsMain.map(r => r.W_new).sort((a,b) => a - b);
  expect(widths).toEqual([285, 295, 305]);
  expect(res.resultsMain).toHaveLength(3);
  // Ensure no suggested rim is smaller than base R
  res.resultsMain.forEach(r => expect(r.R_new).toBeGreaterThan(17));
});


test('alternative prioritizes larger rim for 205/70 R15 scenario (no smaller-rim alt)', () => {
  const input = { R_old: 15, W_old: 205, V_old: 70 };
  const res = calculateNewSizes(input);
  const maxMainR = Math.max(...res.resultsMain.map(r => r.R_new));
  if (res.bestAlternativeResult) {
    expect(res.bestAlternativeResult.R_new).toBeGreaterThan(maxMainR);
  } else {
    expect(res.bestAlternativeResult).toBeNull();
  }
});
*/


describe('pickBetterAlternative', () => {
  test('selects by larger R first, then by smaller |delta| on equal R', () => {
    // We search a small space of inputs to find a case where alternative selection
    // will encounter multiple candidates: first sets alt, then a larger-R candidate replaces it,
    // and finally an equal-R candidate with smaller |delta| replaces it again.
    // This ensures branches at lines 187-193 in calculator.ts are executed.

    // Build synthetic candidates
    const make = (R_new: number, delta: number): any => ({
      W_new: 0,
      R_new,
      V_new: 0,
      D_total_new: 0,
      delta,
      delta_percent: 0,
      newSize: `${R_new}`,
    });

    const c1 = make(19, 5);  // initial pick
    const c2 = make(20, 10); // larger R replaces c1
    const c3 = make(20, 3);  // equal R with smaller |delta| replaces c2
    const c4 = make(20, 4);  // equal R with larger |delta| does not replace c3

    let current = null;
    current = pickBetterAlternative(current, c1);
    expect(current).toBe(c1);
    current = pickBetterAlternative(current, c2);
    expect(current).toBe(c2);
    current = pickBetterAlternative(current, c3);
    expect(current).toBe(c3);
    current = pickBetterAlternative(current, c4);
    expect(current).toBe(c3);
  });
});



describe('calculateNewSizes yields an alternative for some input', () => {
  test('finds an input with non-null alternative (executes alt selection)', () => {
    let found = null as null | { input: { R_old: number; W_old: number; V_old: number }; res: ReturnType<typeof calculateNewSizes> };

    outer: for (let R = 12; R <= 22; R += 1) {
      for (let W = 145; W <= 265; W += 10) {
        for (let V = 40; V <= 70; V += 5) {
          const input = { R_old: R, W_old: W, V_old: V };
          const res = calculateNewSizes(input);
          const maxMainR = Math.max(...res.resultsMain.map(r => r.R_new), input.R_old);
          if (res.bestAlternativeResult && res.bestAlternativeResult.R_new > maxMainR) {
            found = { input, res };
            break outer;
          }
        }
      }
    }

    expect(found).not.toBeNull();
  });
});
