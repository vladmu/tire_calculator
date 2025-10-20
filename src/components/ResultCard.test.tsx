import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultCard } from './ResultCard';
import { SingleProfileResult } from '../types/types';

const renderWithTheme = (ui: React.ReactElement) => render(ui);

const baseResult: SingleProfileResult = {
  W_new: 215,
  R_new: 18,
  V_new: 45,
  D_total_new: 660.3,
  delta: 1.2,
  delta_percent: 0.18,
  newSize: '215/45 R18',
  V_needed_float: 45.3
};

test('ResultCard renders main option with best flag', () => {
  renderWithTheme(<ResultCard result={baseResult} isBestInMain baseWidth={205} maxDeltaPercent={2} />);
  expect(screen.getByText(/Варіант W\+10/i)).toBeInTheDocument();
  expect(screen.getByTitle('Найкращий')).toBeInTheDocument();
  expect(screen.getByText(baseResult.newSize)).toBeInTheDocument();
});

test('ResultCard renders alternative option with alt flag', () => {
  renderWithTheme(<ResultCard result={baseResult} isAlternative baseWidth={205} maxDeltaPercent={2} />);
  expect(screen.getByText(/НАЙКРАЩА АЛЬТЕРНАТИВА/i)).toBeInTheDocument();
  expect(screen.getByTitle('Альтернатива')).toBeInTheDocument();
});



test('ResultCard shows negative widthDelta without plus sign (W-10)', () => {
  const baseResult = {
    W_new: 195,
    R_new: 18,
    V_new: 45,
    D_total_new: 660.3,
    delta: 1.2,
    delta_percent: 0.18,
    newSize: '195/45 R18',
    V_needed_float: 45.3
  } as any;

  render(<ResultCard result={baseResult} baseWidth={205} maxDeltaPercent={2} />);
  expect(screen.getByText(/Варіант W-10/i)).toBeInTheDocument();
});



test('ResultCard shows "Без зміни ширини" when width unchanged', () => {
  // baseResult.W_new is 215; set baseWidth to 215 to simulate no width change
  render(<ResultCard result={baseResult as SingleProfileResult} baseWidth={215} maxDeltaPercent={2} />);
  expect(screen.getByText(/Без зміни ширини/i)).toBeInTheDocument();
});
