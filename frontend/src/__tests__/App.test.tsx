import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../adapters/ui/App';

// Mock the required services
vi.mock('../adapters/infrastructure/ApiRouteService', () => ({
  ApiRouteService: class {
    getAllRoutes = vi.fn().mockResolvedValue([])
    setBaseline = vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock getBoundingClientRect for the anchor animation
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 0));

describe('App', () => {
  it('renders navigation tabs', async () => {
    render(<App />);
    
    // Check for navigation tabs
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveTextContent(/Routes/i);
    expect(tabs[1]).toHaveTextContent(/Compare/i);
    expect(tabs[2]).toHaveTextContent(/Banking/i);
    expect(tabs[3]).toHaveTextContent(/Pooling/i);
  });
});
