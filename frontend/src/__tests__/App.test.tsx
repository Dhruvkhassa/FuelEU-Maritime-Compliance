import { render, screen } from '../test-utils';
import { describe, expect, it, vi } from 'vitest';
import App from '../adapters/ui/App';

// Mock the route service response
vi.mock('../adapters/infrastructure/ApiRouteService', () => ({
  ApiRouteService: class {
    getAllRoutes = vi.fn().mockResolvedValue([])
    setBaseline = vi.fn().mockResolvedValue({})
    getComparison = vi.fn().mockResolvedValue({ baseline: {}, comparisons: [] })
  }
}));

describe('App', () => {
  it('renders main navigation', () => {
    render(<App />);
    
    // Test main navigation elements
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Test individual tabs
    ['Routes', 'Compare', 'Banking', 'Pooling'].forEach(tabName => {
      expect(screen.getByRole('tab', { name: new RegExp(tabName, 'i') }))
        .toBeInTheDocument();
    });
  });
});
