import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputForm } from './InputForm';
import { calculatorStore } from '../stores/CalculatorStore';

const renderWithTheme = (ui: React.ReactElement) => render(ui);

beforeEach(() => {
  calculatorStore.reset();
});

test('InputForm renders fields with default per-R minimums and submit button', () => {
  renderWithTheme(<InputForm />);
  const r = screen.getByLabelText(/Діаметр диска/i) as HTMLInputElement;
  const w = screen.getByLabelText(/Ширина шини/i) as HTMLInputElement;
  const v = screen.getByLabelText(/Профіль/i) as HTMLInputElement;
  expect(r).toBeInTheDocument();
  expect(w).toBeInTheDocument();
  expect(v).toBeInTheDocument();
  // Defaults: R=12, W=135, V=60
  expect(r.value).toBe('12');
  expect(w.value).toBe('135');
  expect(v.value).toBe('60');
  expect(screen.getByRole('button', { name: /Розрахувати нові розміри/i })).toBeInTheDocument();
});

test('arrow buttons update store values and submitting calls calculate', async () => {
  renderWithTheme(<InputForm />);


  // Increase R from 12 to 17 via right arrow (5 clicks)
  const moreR = screen.getByRole('button', { name: 'more R' });
  for (let i = 0; i < 5; i++) {
    await userEvent.click(moreR);
  }
  expect(calculatorStore.R_old).toBe('17');
  // After R change, W/V reset to per-R mins (R=17 => minW=185, minV=35)
  expect(calculatorStore.W_old).toBe('185');
  expect(calculatorStore.V_old).toBe('35');

  // Increase W from 185 to 205 (2 clicks of 10mm)
  const moreW = screen.getByRole('button', { name: 'more W' });
  await userEvent.click(moreW);
  await userEvent.click(moreW);
  expect(calculatorStore.W_old).toBe('205');

  // Increase V from 35 to 50 (3 clicks of 5%)
  const moreV = screen.getByRole('button', { name: 'more V' });
  await userEvent.click(moreV);
  await userEvent.click(moreV);
  await userEvent.click(moreV);
  expect(calculatorStore.V_old).toBe('50');

  // Now lessR and lessW are enabled — click them to cover handlers
  const lessR = screen.getByRole('button', { name: 'less R' });
  const lessW = screen.getByRole('button', { name: 'less W' });
  // Click less W first while R=17 so it's enabled: 205 -> 195
  await userEvent.click(lessW);
  expect(calculatorStore.W_old).toBe('195');
  // Then click less R: 17 -> 16 (this will also reset W/V to R=16 mins internally)
  await userEvent.click(lessR);
  expect(calculatorStore.R_old).toBe('16');

  await userEvent.click(screen.getByRole('button', { name: /Розрахувати нові розміри/i }));
  // Assert that calculation produced results in the store (avoid spying on bound actions)
  expect(calculatorStore.results).not.toBeNull();
});

test('inputs have expected numeric attributes (dynamic min/max and steps) and arrow focus coloring', async () => {
  renderWithTheme(<InputForm />);
  const r = screen.getByLabelText(/Діаметр диска/i) as HTMLInputElement;
  const w = screen.getByLabelText(/Ширина шини/i) as HTMLInputElement;
  const v = screen.getByLabelText(/Профіль/i) as HTMLInputElement;

  expect(r.getAttribute('type')).toBe('number');
  expect(r.getAttribute('min')).toBe('12');
  expect(r.getAttribute('max')).toBe('25');
  expect(r.getAttribute('step')).toBe('1');

  expect(w.getAttribute('type')).toBe('number');
  expect(w.getAttribute('min')).toBe('135');
  expect(w.getAttribute('max')).toBe('205');
  expect(w.getAttribute('step')).toBe('10');

  expect(v.getAttribute('type')).toBe('number');
  expect(v.getAttribute('min')).toBe('60');
  expect(v.getAttribute('max')).toBe('90');
  expect(v.getAttribute('step')).toBe('5');

  // Focus coloring: by default, R is focused (initial state), so more R has primary color class
  const moreR = screen.getByRole('button', { name: 'more R' });
  const moreW = screen.getByRole('button', { name: 'more W' });
  expect(moreR.className).toMatch(/MuiIconButton-colorPrimary/);
  expect(moreW.className).not.toMatch(/MuiIconButton-colorPrimary/);

  // Focusing W should move active color to W arrows
  await userEvent.click(w);
  expect(moreW.className).toMatch(/MuiIconButton-colorPrimary/);
  expect(moreR.className).not.toMatch(/MuiIconButton-colorPrimary/);
});



test('left arrow buttons are disabled at minimum and focus highlighting works; right arrows disable at maximum', async () => {
  const { unmount } = renderWithTheme(<InputForm />);
  const lessR = screen.getByRole('button', { name: 'less R' });
  const lessW = screen.getByRole('button', { name: 'less W' });
  const lessV = screen.getByRole('button', { name: 'less V' });
  const moreR = screen.getByRole('button', { name: 'more R' });
  const moreW = screen.getByRole('button', { name: 'more W' });
  const moreV = screen.getByRole('button', { name: 'more V' });

  // At defaults (R=12, W=135, V=60) left arrows must be disabled
  expect(lessR).toBeDisabled();
  expect(lessW).toBeDisabled();
  expect(lessV).toBeDisabled();

  // Focus to V by clicking its more arrow, then less V at min stays disabled until increment
  await userEvent.click(moreV); // focus V and increment to 65
  expect(calculatorStore.V_old).toBe('65');
  expect(lessV).not.toBeDisabled();
  await userEvent.click(lessV); // back to 60 (min)
  expect(calculatorStore.V_old).toBe('60');
  expect(lessV).toBeDisabled();

  // After focusing V, its arrows should have primary color
  const moreVBtn = screen.getByRole('button', { name: 'more V' });
  expect(moreVBtn.className).toMatch(/MuiIconButton-colorPrimary/);

  // Drive R to its maximum to see right arrow become disabled
  const rSteps = 25 - Number(calculatorStore.R_old);
  for (let i = 0; i < rSteps; i++) { await userEvent.click(moreR); }
  expect(calculatorStore.R_old).toBe('25');
  expect(moreR).toBeDisabled();

  // Drive W to its maximum for current R and assert right disabled (use exact number of 10mm steps)
  const wSteps = Math.ceil((calculatorStore.currentMaxW - Number(calculatorStore.W_old)) / 10);
  for (let i = 0; i < wSteps; i++) { await userEvent.click(moreW); }
  expect(Number(calculatorStore.W_old)).toBe(calculatorStore.currentMaxW);
  expect(moreW).toBeDisabled();

  unmount();
});
