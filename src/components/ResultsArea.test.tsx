import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsArea } from './ResultsArea';
import { calculatorStore } from '../stores/CalculatorStore';
import { calculateTotalDiameter } from '../services/calculator';
import { SingleProfileResult } from '../types/types';

const renderWithTheme = (ui: React.ReactElement) => render(ui);

function makeResult(W_new: number, R_new: number, V_new: number, base: { R: number; W: number; V: number }): SingleProfileResult {
  const D_total_old = calculateTotalDiameter(base.R, base.W, base.V);
  const D_total_new = calculateTotalDiameter(R_new, W_new, V_new);
  const delta = D_total_new - D_total_old;
  const delta_percent = (delta / D_total_old) * 100;
  return {
    W_new, R_new, V_new, D_total_new,
    delta, delta_percent,
    newSize: `${W_new}/${V_new} R${R_new}`,
    V_needed_float: V_new
  };
}

test('ResultsArea renders initial and option cards including alternative', () => {
  // Prepare store
  calculatorStore.setR('17');
  // Use raw setters to avoid rounding/clamping affecting displayed initial values
  calculatorStore.setWRaw('205');
  calculatorStore.setVRaw('50');

  const base = { R: 17, W: 205, V: 50 };
  const D_total_old = calculateTotalDiameter(base.R, base.W, base.V);

  const main = makeResult(215, 18, 45, base);
  const alt = makeResult(195, 19, 40, base);

  calculatorStore.results = {
    initialSizeKey: `${base.W}/${base.V} R${base.R}`,
    D_total_old,
    resultsMain: [main],
    bestMainResult: main,
    bestAlternativeResult: alt
  };

  renderWithTheme(<ResultsArea />);

  // Initial card
  expect(screen.getByText('Поточний розмір')).toBeInTheDocument();
  expect(screen.getByText(`${base.W}/${base.V} R${base.R}`)).toBeInTheDocument();

  // Main card
  expect(screen.getByText(main.newSize)).toBeInTheDocument();
  expect(screen.getByText('Best')).toBeInTheDocument();

  // Alternative card
  expect(screen.getByText(/НАЙКРАЩА АЛЬТЕРНАТИВА/i)).toBeInTheDocument();
  expect(screen.getByText(alt.newSize)).toBeInTheDocument();
});



test('ResultsArea renders without alternative card when none provided', () => {
  // Intentionally do NOT set store input fields to cover the nullish coalescing branch (baseWidth fallback)
  const base = { R: 17, W: 205, V: 50 };
  const D_total_old = calculateTotalDiameter(base.R, base.W, base.V);
  const main: SingleProfileResult = {
    W_new: 215, R_new: 18, V_new: 45,
    D_total_new: calculateTotalDiameter(18, 215, 45),
    delta: calculateTotalDiameter(18, 215, 45) - D_total_old,
    delta_percent: ((calculateTotalDiameter(18, 215, 45) - D_total_old) / D_total_old) * 100,
    newSize: '215/45 R18',
    V_needed_float: 45
  };

  calculatorStore.results = {
    initialSizeKey: `${base.W}/${base.V} R${base.R}`,
    D_total_old,
    resultsMain: [main],
    bestMainResult: main,
    bestAlternativeResult: null
  };

  renderWithTheme(<ResultsArea />);

  expect(screen.getByText('Поточний розмір')).toBeInTheDocument();
  expect(screen.queryByText(/АБСОЛЮТНО НАЙКРАЩА АЛЬТЕРНАТИВА/i)).not.toBeInTheDocument();
});
