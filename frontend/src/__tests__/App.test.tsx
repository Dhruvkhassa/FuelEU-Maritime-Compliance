import { render, screen, waitFor } from '../test-utils';
import { describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
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
  it('renders main navigation and loads data', async () => {
    await act(async () => {
    render(<App />);
    });
    
    // Test main navigation elements
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Test individual tab buttons
    ['🚢Routes', '📊Compare', '💰Banking', '🤝Pooling'].forEach(tabName => {
      expect(screen.getByRole('button', { name: tabName }))
        .toBeInTheDocument();
    });

    // Initially shows loading state
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText('Routes Management')).toBeInTheDocument();
    });
  });
});
