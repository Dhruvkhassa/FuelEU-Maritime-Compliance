import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../adapters/ui/App';

describe('App', () => {
  test('renders title and navigation tabs', () => {
    render(<App />);
    expect(screen.getByText(/Fuel EU Maritime Compliance Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Routes/i)).toBeInTheDocument();
    expect(screen.getByText(/Compare/i)).toBeInTheDocument();
    expect(screen.getByText(/Banking/i)).toBeInTheDocument();
    expect(screen.getByText(/Pooling/i)).toBeInTheDocument();
  });
});
