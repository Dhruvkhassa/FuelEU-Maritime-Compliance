import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../adapters/ui/App';

describe('App', () => {
  test('renders title and navigation tabs', () => {
    render(<App />);
  expect(screen.getByRole('heading', { name: /Fuel EU Maritime Compliance Dashboard/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /Routes/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /Compare/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /Banking/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /Pooling/i })).toBeTruthy();
  });
});
