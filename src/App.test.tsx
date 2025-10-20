import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { calculatorStore } from './stores/CalculatorStore';

beforeEach(() => {
  calculatorStore.reset();
});

const renderWithProviders = () => render(<App />);

// Smoke: renders header
test('renders header title', () => {
  renderWithProviders();
  expect(screen.getByText(/Калькулятор підбору шин і дисків/i)).toBeInTheDocument();
});

// Integration: end-to-end flow using default values and seeing results
 test('full flow: click calculate and see results', async () => {
  renderWithProviders();

  await userEvent.click(screen.getByRole('button', { name: /Розрахувати нові розміри/i }));

  expect(await screen.findByText('Поточний розмір')).toBeInTheDocument();
});

// Error path: shows validation error when submitting empty form
test('shows validation error when submitting empty form', async () => {
  // Simulate invalid state programmatically since inputs are read-only
  calculatorStore.setRRaw('');
  calculatorStore.setWRaw('');
  calculatorStore.setVRaw('');
  renderWithProviders();
  await userEvent.click(screen.getByRole('button', { name: /Розрахувати нові розміри/i }));
  expect(await screen.findByText(/Будь ласка, введіть коректні числові значення\./i)).toBeInTheDocument();
});
