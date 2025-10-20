import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfoBlock } from './InfoBlock';

test('InfoBlock renders limits accordion and table headers', async () => {
  render(<InfoBlock />);
  // Open info panel first
  const infoBtn = screen.getByRole('button', { name: /Інформація/i });
  await userEvent.click(infoBtn);
  // Now expand the accordion with limits
  const accordionBtn = await screen.findByRole('button', { name: /Мінімальні та Максимальні ліміти/i });
  await userEvent.click(accordionBtn);
  const table = await screen.findByRole('table');
  const headers = within(table).getAllByRole('columnheader');
  expect(headers.map(h => h.textContent)).toEqual(expect.arrayContaining(['W (мм)', 'V (%)']));
});
