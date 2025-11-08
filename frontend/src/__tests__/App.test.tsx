import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../adapters/ui/App';

describe('App', () => {
  it('renders navigation tabs', async () => {
    render(<App />);
    
    // Find the tabs by their accessible role and name
    const routesTab = screen.getByRole('tab', { name: /Routes/i });
    const compareTab = screen.getByRole('tab', { name: /Compare/i });
    const bankingTab = screen.getByRole('tab', { name: /Banking/i });
    const poolingTab = screen.getByRole('tab', { name: /Pooling/i });
    
    // Assert that each tab is present
    expect(routesTab).toBeInTheDocument();
    expect(compareTab).toBeInTheDocument();
    expect(bankingTab).toBeInTheDocument();
    expect(poolingTab).toBeInTheDocument();
  });
});
