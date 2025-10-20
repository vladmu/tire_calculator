import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

test('Header renders title and icon', () => {
  render(<Header />);
  expect(screen.getByText(/Калькулятор підбору шин і дисків/i)).toBeInTheDocument();
});
