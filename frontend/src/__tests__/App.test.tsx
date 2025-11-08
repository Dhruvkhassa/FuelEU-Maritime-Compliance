import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../adapters/ui/App';

describe('App', () => {
  it('renders title and navigation tabs', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Fuel EU Maritime Compliance/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Routes/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Compare/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Banking/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Pooling/i })).toBeTruthy();
  });
});
